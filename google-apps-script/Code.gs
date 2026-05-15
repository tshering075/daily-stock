/**
 * Daily Stock — Google Apps Script
 *
 * HOW TO SET UP (important):
 * 1. Open your Google Sheet in the browser (sheets.google.com).
 * 2. Extensions → Apps Script (NOT script.google.com by itself).
 * 3. Paste this entire file → Save (Ctrl+S).
 * 4. In the function dropdown, choose "runSetup" → Run → Allow permissions.
 * 5. Check your sheet for a tab named "Daily Stock".
 * 6. Deploy → New deployment → Web app → Anyone → copy /exec URL to .env
 *
 * If runSetup still fails: copy your Sheet ID from the URL
 *   https://docs.google.com/spreadsheets/d/PASTE_ID_HERE/edit
 * and paste it into SPREADSHEET_ID below, then run runSetup again.
 */

/** Leave empty if the script was created from Extensions → Apps Script inside the sheet. */
var SPREADSHEET_ID = '';

var SHEET_NAME = 'Daily Stock';

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
  var sheet = ensureSheetWithHeaders(ss);
  Logger.log('OK: Sheet "' + SHEET_NAME + '" is ready in "' + ss.getName() + '".');
  return 'Success — open the "' + SHEET_NAME + '" tab in: ' + ss.getUrl();
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

function ensureSheetWithHeaders(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    writeHeaderRow(sheet);
    return sheet;
  }

  var firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell !== HEADERS[0]) {
    // New sheet layout — add a fresh tab instead of clearing user data
    var newName = SHEET_NAME + ' ' + Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
    sheet = ss.insertSheet(newName);
    writeHeaderRow(sheet);
    Logger.log('Created new tab "' + newName + '" because existing "' + SHEET_NAME + '" had different headers.');
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
  ensureSheetWithHeaders(getSpreadsheet());
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
    var sheet = ensureSheetWithHeaders(ss);
    var data = JSON.parse(e.postData.contents);
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
