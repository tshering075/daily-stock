/**
 * Daily Stock — Google Apps Script
 *
 * HOW TO SET UP (important):
 * 1. Open your Google Sheet in the browser (sheets.google.com).
 * 2. Extensions → Apps Script (NOT script.google.com by itself).
 * 3. Paste this entire file → Save (Ctrl+S).
 * 4. In the function dropdown, choose "runSetup" → Run → Allow permissions.
 * 5. Check your sheet for tabs named Eastern, Western, and Southern.
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

/**
 * Run THIS function from the editor (not doPost, not setupSheet alone).
 */
function runSetup() {
  var ss = getSpreadsheet();
  ensureAllRegionSheets(ss);
  Logger.log('OK: Region tabs are ready in "' + ss.getName() + '".');
  return 'Success — open the Eastern, Western, or Southern tabs in: ' + ss.getUrl();
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

function ensureAllRegionSheets(ss) {
  for (var i = 0; i < REGION_SHEET_NAMES.length; i++) {
    ensureSheetWithHeaders(ss, REGION_SHEET_NAMES[i]);
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

function ensureSheetWithHeaders(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    writeHeaderRow(sheet);
    return sheet;
  }

  var firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell !== HEADERS[0]) {
    var newName =
      sheetName + ' ' + Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
    sheet = ss.insertSheet(newName);
    writeHeaderRow(sheet);
    Logger.log('Created new tab "' + newName + '" because existing "' + sheetName + '" had different headers.');
  }

  return sheet;
}

function writeHeaderRow(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

/** Used by doPost — do not run from the editor. */
function setupSheet() {
  ensureAllRegionSheets(getSpreadsheet());
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
    var sheetName = resolveRegionSheetName(data.region);
    var sheet = ensureSheetWithHeaders(ss, sheetName);
    var csd = productRow('csd', data);
    var kinley = productRow('kinleyWater', data);

    sheet.appendRow([
      formatDisplayDate(new Date(), ss),
      data.entryType === 'distributor' ? 'Distributor' : 'Pre-seller',
      data.preseller || '—',
      data.distributor || '',
      data.region || '',
      csd[0],
      csd[1],
      csd[2],
      csd[3],
      kinley[0],
      kinley[1],
      kinley[2],
      kinley[3],
    ]);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err.message || err) });
  }
}

function doGet() {
  return jsonResponse({ status: 'ok', message: 'Daily Stock API is running' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
