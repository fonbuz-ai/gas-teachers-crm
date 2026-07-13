// File: UserService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const UserService = {
  getUserByEmail: function(email) {
    if (!email) return null;
    const normalized = String(email).trim().toLowerCase();
    const allUsers = DataRepository.selectAll(Config.SHEET_NAMES.USERS);
    return allUsers.find(u => String(u.email).trim().toLowerCase() === normalized) || null;
  },

  getUserScopes: function(email) {
    if (!email) return [];
    const normalized = String(email).trim().toLowerCase();
    const allScopes = DataRepository.selectAll(Config.SHEET_NAMES.USER_SCOPES);
    return allScopes.filter(s => String(s.user_email).trim().toLowerCase() === normalized);
  }
};
