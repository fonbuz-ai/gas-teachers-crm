// File: AuthService.gs
// 狀態：已實作 (IMPLEMENTED) - 尚未在 Apps Script 真實環境中驗證

const AuthService = {
  // 取得當前 Session 登入的 Google Email (身份唯一的信任根)
  getActiveUserEmail: function() {
    const email = Session.getActiveUser().getEmail();
    if (!email) {
      throw new Error("Unauthorized: 無法讀取您的 Google 登入帳號，存取遭拒。");
    }
    return email.trim().toLowerCase();
  },

  // 取得當前登入者於 users 表之基本資料
  getCurrentUser: function() {
    const email = this.getActiveUserEmail();
    const user = UserService.getUserByEmail(email);
    if (!user) {
      throw new Error("Unauthorized: 您的帳號在系統中尚未註冊，請聯絡系統管理員。");
    }
    const isActive = user.active === true || String(user.active).toUpperCase() === "TRUE" || String(user.active).toLowerCase() === "true";
    if (!isActive) {
      throw new Error("Unauthorized: 您的帳號已被停用，存取遭拒。");
    }
    return user;
  }
};
