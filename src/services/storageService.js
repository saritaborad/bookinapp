import settings from "../settings";

class StorageService {
  canSaveLocalStorage =
    // eslint-disable-next-line
    localStorage.getItem(settings.marketingAgreement) == "true";

  saveStorageIfPossible(key, value) {
    // if (this.canSaveLocalStorage) {
      localStorage.setItem(key, value);
    // }
  }

  setAgreement(value) {
    if (!value) {
      this.clearUserData();
    }

    this.canSaveLocalStorage = value;
    localStorage.setItem(settings.marketingAgreement, value);
  }

  clearUserData() {
    localStorage.clear();
  }
}

export const storageService = new StorageService();
