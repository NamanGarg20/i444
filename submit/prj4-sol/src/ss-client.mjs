
import axios from 'axios';

/** Wrapper which calls spreadsheet web-services at baseUrl.
 *
 * If a web service error occurs and that error is understood, then the
 * error is rethrown with the following fields:
 *
 *   status: The HTTP status code returned by the web service.
 *
 *   error: The error object returned by the web service.  The error
 *   object will have a 'code' field giving a succinct
 *   characterization of the error and a 'message' field giving the
 *   details of the error.
 *
 * If the error is not understood then it is simply rethrown.
 */

const BASE = '/api/store/';

const url = 'http://localhost:2345';

export default class SSClient {

  static async make(serverBaseUrl) {
    return new SSClient(serverBaseUrl);
  }

  constructor(url) {
    const axiosInstance = axios.create({baseURL: url});
    this.axios = axiosInstance;
  }

    /** Update cellId for spreadsheet ssName to contain formula */
  async updateCell(ssName, cellId, formula) {
    try {
      
        var resp = await axios.patch(url + BASE + ssName + '/' + cellId, {formula: formula});
    }
    catch (err) {
      rethrow(err);
    }
    
  }

  /** Clear contents of spreadsheet ssName */
  async clear(ssName) {
    try {
      var resp = await axios.delete(url + BASE  + ssName);
    }
    catch (err) {
      rethrow(err);
    }
    
  }

  /** Delete all info for cellId from spreadsheet ssName. */
  async delete(ssName, cellId) {
    try {
      var resp = await axios.delete(url + BASE  + ssName + '/' + cellId);
    }
    catch (err) {
      rethrow(err);
    }
  }

  /** Return list of pairs of cellId, formula for spreadsheet ssName */
  async readFormulas(ssName) {
    try {
      var resp = await axios.get(url + BASE  + ssName)
      return resp.data;
    }
    catch (err) {
      rethrow(err);
    }
  }

}

function rethrow(err) {
  if (err.response && err.response.data && err.response.data.error) {
    throw { status: err.response.status,
        error: err.response.data.error,
      };
  }
  else {
    throw err;
  }
}
