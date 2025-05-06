import axios from 'axios';
import { message } from 'antd';
import { saveAs } from 'file-saver'; // Import file-saver for handling blob downloads
import Papa from 'papaparse'; // Import papaparse for handling direct data

/**
 * Handles exporting data to CSV.
 * Can fetch data from an API endpoint or export data passed directly.
 *
 * @param {string|Array<object>} source - Either the API URL (string) or the data array (Array<object>).
 * @param {string} [type='items'] - The type of data being exported (e.g., 'items', 'forecast'). Used for API endpoint and filename.
 * @param {string} [filename] - Optional filename (without extension). Defaults to the type.
 */
export const handleExportCSV = async (source, type = 'items', filename) => {
  const exportFilename = `${filename || type}.csv`;

  try {
    let csvDataBlob;

    // Check if source is data array or API URL string
    if (Array.isArray(source)) {
      // Source is data array (e.g., from Analytics)
      if (source.length === 0) {
        message.warning('No data to export.');
        return;
      }
      const csvString = Papa.unparse(source);
      csvDataBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    } else if (typeof source === 'string') {
      // Source is API URL
      const apiUrl = source;
      let exportUrl;

      // Construct the correct API endpoint based on type
      switch (type) {
        case 'items':
          exportUrl = `${apiUrl}/api/items/export`; // Corrected URL
          break;
        case 'forecast':
          exportUrl = `${apiUrl}/api/forecast/export`; // Use the new backend endpoint
          break;
        // Add cases for other types if needed
        default:
          message.error(`Unknown export type: ${type}`);
          return;
      }

      // Fetch data from the API
      const response = await axios.get(exportUrl, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Ensure token is sent
        responseType: 'blob', // Expecting blob data from the server
      });
      csvDataBlob = response.data;

    } else {
      message.error('Invalid source provided for CSV export.');
      return;
    }

    // Use file-saver to trigger the download
    saveAs(csvDataBlob, exportFilename);

    message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully!`);

  } catch (err) {
    // Handle errors
    const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
    // If the response is blob, it might not have a JSON message, try to read it as text
    let detailMessage = errorMessage;
    if (err.response?.data instanceof Blob && err.response?.data?.type?.includes('json')) {
        try {
            const errorJson = JSON.parse(await err.response.data.text());
            detailMessage = errorJson.message || errorMessage;
        } catch (parseError) {
            // Ignore if blob isn't valid JSON
        }
    }
    message.error(`Failed to export ${type} CSV: ${detailMessage}`);
    console.error(`Export error (${type}):`, err.response || err);
  }
};

// Make sure to install file-saver and papaparse if you haven't already:
// npm install file-saver papaparse
// or
// yarn add file-saver papaparse