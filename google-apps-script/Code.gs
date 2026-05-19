/**
 * Daily Stock — Google Apps Script
 *
 * HOW TO SET UP (important):
 * 1. Open your Google Sheet in the browser (sheets.google.com).
 * 2. Extensions → Apps Script (NOT script.google.com by itself).
 * 3. Paste this entire file → Save (Ctrl+S).
 * 4. In the function dropdown, choose "runSetup" → Run → Allow permissions.
 * 5. Check your sheet for region tabs + "{Region} SKU details" tabs.
 * 6. Deploy → New deployment → Web app → Anyone → copy /exec URL to .env
 *
 * If runSetup still fails: copy your Sheet ID from the URL
 *   https://docs.google.com/spreadsheets/d/PASTE_ID_HERE/edit
 * and paste it into SPREADSHEET_ID below, then run runSetup again.
 */

/** Leave empty if the script was created from Extensions → Apps Script inside the sheet. */
var SPREADSHEET_ID = '';

/** One tab per region; names must match the app (constants/distributors.ts). */
var REGION_SHEET_NAMES = ['Eastern', 'Western', 'Southern'];

var HEADERS = [
  'Timestamp',
  'Entry Type',
  'Pre-seller',
  'Distributor',
  'Region',
  'CSD Opening',
  'CSD Primary Sale',
  'CSD Physical Stock',
  'CSD Secondary Sale',
  'Kinley Opening',
  'Kinley Primary Sale',
  'Kinley Physical Stock',
  'Kinley Secondary Sale',
];

var SKU_DETAILS_HEADERS = [
  'Distributor',
  'Region',
  'Date',
  'Product SKU',
  'FIFO Lot No.',
  'MFG Date',
  'Batch No.',
  'BBD Date',
  'Opening Stock',
  'Primary Sale',
  'Physical Stock',
  'Secondary Sale',
];

/**
 * Run THIS function from the editor (not doPost, not setupSheet alone).
 */
function runSetup() {
  var ss = getSpreadsheet();
  ensureAllRegionSheets(ss);
  ensureAllSkuDetailSheets(ss);
  Logger.log('OK: Region + SKU detail tabs are ready in "' + ss.getName() + '".');
  return 'Success — open region tabs and SKU details tabs in: ' + ss.getUrl();
}

function getSpreadsheet() {
  if (SPREADSHEET_ID && String(SPREADSHEET_ID).trim() !== '') {
    return SpreadsheetApp.openById(String(SPREADSHEET_ID).trim());
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      'No spreadsheet found. Open your Google Sheet → Extensions → Apps Script and paste this code there. ' +
        'Or set SPREADSHEET_ID at the top of Code.gs to your sheet ID from the browser URL.'
    );
  }
  return ss;
}

function skuDetailsSheetName(region) {
  return resolveRegionSheetName(region) + ' SKU details';
}

function ensureAllRegionSheets(ss) {
  for (var i = 0; i < REGION_SHEET_NAMES.length; i++) {
    ensureSheetWithHeaders(ss, REGION_SHEET_NAMES[i], HEADERS);
  }
}

function ensureAllSkuDetailSheets(ss) {
  for (var i = 0; i < REGION_SHEET_NAMES.length; i++) {
    ensureSheetWithHeaders(ss, REGION_SHEET_NAMES[i] + ' SKU details', SKU_DETAILS_HEADERS);
  }
}

function resolveRegionSheetName(region) {
  var raw = String(region || '').trim();
  if (!raw) {
    throw new Error('Region is required.');
  }

  var lower = raw.toLowerCase();
  for (var i = 0; i < REGION_SHEET_NAMES.length; i++) {
    if (REGION_SHEET_NAMES[i].toLowerCase() === lower) {
      return REGION_SHEET_NAMES[i];
    }
  }

  throw new Error(
    'Unknown region "' +
      raw +
      '". Expected one of: ' +
      REGION_SHEET_NAMES.join(', ') +
      '.'
  );
}

function ensureSheetWithHeaders(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    writeHeaderRow(sheet, headers);
    return sheet;
  }

  var firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell !== headers[0]) {
    var newName =
      sheetName + ' ' + Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
    sheet = ss.insertSheet(newName);
    writeHeaderRow(sheet, headers);
    Logger.log('Created new tab "' + newName + '" because existing "' + sheetName + '" had different headers.');
  }

  return sheet;
}

function writeHeaderRow(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/** Used by doPost — do not run from the editor. */
function setupSheet() {
  var ss = getSpreadsheet();
  ensureAllRegionSheets(ss);
  ensureAllSkuDetailSheets(ss);
}

function num(val) {
  var n = Number(val);
  return isNaN(n) ? 0 : n;
}

/** e.g. 1st May 2026 */
function formatDisplayDate(date, ss) {
  var tz = ss.getSpreadsheetTimeZone();
  var day = Number(Utilities.formatDate(date, tz, 'd'));
  var month = Utilities.formatDate(date, tz, 'MMMM');
  var year = Utilities.formatDate(date, tz, 'yyyy');
  return day + ordinalSuffix(day) + ' ' + month + ' ' + year;
}

function ordinalSuffix(day) {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function productRow(prefix, data) {
  var block = data[prefix];
  if (!block) {
    return [0, 0, 0, 0];
  }
  return [
    num(block.openingStock),
    num(block.primarySale),
    num(block.physicalStock),
    num(block.secondarySale),
  ];
}

/** Sum opening / primary / physical / secondary from SKU detail rows for region summary. */
function aggregateTotalsFromSkuDetails(skuDetails) {
  var csd = [0, 0, 0, 0];
  var kinley = [0, 0, 0, 0];

  if (!skuDetails || !skuDetails.length) {
    return { csd: csd, kinley: kinley };
  }

  for (var i = 0; i < skuDetails.length; i++) {
    var row = skuDetails[i];
    var opening = num(row.openingStock);
    var primary = num(row.primarySale);
    var physical = num(row.physicalStock);
    var secondary = num(row.secondarySale);
    var skuName = String(row.productSku || '');

    if (skuName.indexOf('Kinley Water') === 0) {
      kinley[0] += opening;
      kinley[1] += primary;
      kinley[2] += physical;
      kinley[3] += secondary;
    } else {
      csd[0] += opening;
      csd[1] += primary;
      csd[2] += physical;
      csd[3] += secondary;
    }
  }

  return { csd: csd, kinley: kinley };
}

/**
 * One row per FIFO lot → "{Region} SKU details" tab (all SKU fields).
 * Returns number of rows written.
 */
function appendSkuDetailRows(ss, region, distributor, displayDate, skuDetails) {
  if (!skuDetails || !skuDetails.length) {
    return 0;
  }

  var sheet = ensureSheetWithHeaders(ss, skuDetailsSheetName(region), SKU_DETAILS_HEADERS);
  var written = 0;

  for (var i = 0; i < skuDetails.length; i++) {
    var row = skuDetails[i];
    sheet.appendRow([
      distributor,
      region,
      displayDate,
      row.productSku || '',
      num(row.fifoLotNo),
      row.mfgDate || '',
      row.batchNo || '',
      row.bbdDate || '',
      num(row.openingStock),
      num(row.primarySale),
      num(row.physicalStock),
      num(row.secondarySale),
    ]);
    written++;
  }

  return written;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        error: 'No POST body. This endpoint is for the mobile app only.',
      });
    }

    var ss = getSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var region = data.region || '';
    var skuDetails = data.skuDetails || [];
    var sheetName = resolveRegionSheetName(region);
    var sheet = ensureSheetWithHeaders(ss, sheetName, HEADERS);
    var displayDate = formatDisplayDate(new Date(), ss);
    var distributor = data.distributor || '';

    // Region tab = one summary row (CSD + Kinley totals). Prefer sums from SKU lots when present.
    var totals = aggregateTotalsFromSkuDetails(skuDetails);
    var csd = skuDetails.length > 0 ? totals.csd : productRow('csd', data);
    var kinley = skuDetails.length > 0 ? totals.kinley : productRow('kinleyWater', data);

    sheet.appendRow([
      displayDate,
      data.entryType === 'distributor' ? 'Distributor' : 'Pre-seller',
      data.preseller || '—',
      distributor,
      region,
      csd[0],
      csd[1],
      csd[2],
      csd[3],
      kinley[0],
      kinley[1],
      kinley[2],
      kinley[3],
    ]);

    // SKU details tab = one row per lot with MFG, batch, BBD, and stock columns.
    var skuRowsWritten = appendSkuDetailRows(ss, region, distributor, displayDate, skuDetails);

    return jsonResponse({ success: true, skuRowsWritten: skuRowsWritten });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err.message || err) });
  }
}

/**
 * Returns MFG / batch / BBD from the distributor's most recent SKU details submission
 * (same region tab). Used to pre-fill the app form the next day.
 */
function getLastSkuLotsForDistributor(ss, region, distributor) {
  var sheet = ss.getSheetByName(skuDetailsSheetName(region));
  if (!sheet) {
    return [];
  }

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    return [];
  }

  var distKey = String(distributor);
  var regionKey = String(region);
  var lastRowIdx = -1;

  for (var i = data.length - 1; i >= 1; i--) {
    var row = data[i];
    if (String(row[0]) === distKey && String(row[1]) === regionKey) {
      lastRowIdx = i;
      break;
    }
  }

  if (lastRowIdx < 0) {
    return [];
  }

  var latestDate = data[lastRowIdx][2];
  var lots = [];

  for (var j = lastRowIdx; j >= 1; j--) {
    var r = data[j];
    if (String(r[0]) !== distKey || String(r[1]) !== regionKey) {
      break;
    }
    if (r[2] !== latestDate) {
      break;
    }
    lots.unshift({
      productSku: String(r[3] || ''),
      fifoLotNo: num(r[4]) || 1,
      mfgDate: String(r[5] || ''),
      batchNo: String(r[6] || ''),
      bbdDate: String(r[7] || ''),
    });
  }

  lots.sort(function (a, b) {
    if (a.productSku !== b.productSku) {
      return a.productSku < b.productSku ? -1 : 1;
    }
    return a.fifoLotNo - b.fifoLotNo;
  });

  return lots;
}

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};

  if (params.action === 'lastSkuLots') {
    try {
      var region = params.region || '';
      var distributor = params.distributor || '';
      if (!region || !distributor) {
        return jsonResponse({
          success: false,
          error: 'region and distributor query parameters are required.',
        });
      }

      var lots = getLastSkuLotsForDistributor(getSpreadsheet(), region, distributor);
      return jsonResponse({
        success: true,
        skuLots: lots,
        loadedFromDate: lots.length ? 'latest' : null,
      });
    } catch (err) {
      return jsonResponse({ success: false, error: String(err.message || err) });
    }
  }

  return jsonResponse({ status: 'ok', message: 'Daily Stock API is running' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
