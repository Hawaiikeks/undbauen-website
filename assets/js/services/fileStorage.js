/* File Storage: S3-ready interface for file uploads */

/**
 * File Storage Interface
 * This provides an abstraction layer for file storage
 * Currently implemented with localStorage (Base64), but can be replaced with S3
 */
export class FileStorage {
  constructor(adapter) {
    this.adapter = adapter;
  }

  /**
   * Upload a file
   * @param {File} file - File to upload
   * @param {Object} options - Upload options
   * @returns {Promise<{url: string, key: string, size: number, mimeType: string}>}
   */
  async upload(file, options = {}) {
    return this.adapter.upload(file, options);
  }

  /**
   * Get signed URL for download
   * @param {string} key - File key/identifier
   * @param {number} expiresIn - Expiration time in seconds (default: 3600)
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(key, expiresIn = 3600) {
    return this.adapter.getSignedUrl(key, expiresIn);
  }

  /**
   * Delete a file
   * @param {string} key - File key/identifier
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    return this.adapter.delete(key);
  }

  /**
   * Validate file
   * @param {File} file - File to validate
   * @param {Object} options - Validation options
   * @returns {{valid: boolean, error?: string}}
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 50 * 1024 * 1024, // 50MB default
      allowedTypes = null, // null = all types allowed
      allowedExtensions = null // null = all extensions allowed
    } = options;

    // Check size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `Datei ist zu groß. Maximal ${this.formatFileSize(maxSize)} erlaubt.`
      };
    }

    // Check type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Dateityp nicht erlaubt. Erlaubte Typen: ${allowedTypes.join(', ')}`
      };
    }

    // Check extension
    if (allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `Dateiendung nicht erlaubt. Erlaubte Endungen: ${allowedExtensions.join(', ')}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Format file size
   * @param {number} bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}












