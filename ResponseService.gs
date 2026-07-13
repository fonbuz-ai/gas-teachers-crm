// File: ResponseService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const ResponseService = {
  success: function(data, message = "") {
    return { success: true, data: data, message: message };
  },
  error: function(message, errorCode = "SYSTEM_ERROR") {
    return { success: false, data: null, message: message, errorCode: errorCode };
  },
  runSecure: function(callback) {
    try {
      const data = callback();
      return this.success(data);
    } catch (e) {
      // 擷取自定義的 ERROR CODE
      const msg = e.message;
      if (msg.indexOf("PERMISSION_DENIED") !== -1) {
        return this.error(msg.replace("PERMISSION_DENIED: ", ""), "PERMISSION_DENIED");
      }
      if (msg.indexOf("NOT_FOUND") !== -1) {
        return this.error(msg.replace("NOT_FOUND: ", ""), "NOT_FOUND");
      }
      return this.error(msg, "SYSTEM_ERROR");
    }
  }
};
