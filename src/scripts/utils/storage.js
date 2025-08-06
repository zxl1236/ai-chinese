/**
 * 本地存储工具类
 * 提供统一的数据存储和读取接口
 */
class Storage {
  constructor() {
    this.prefix = 'ai_yuwen_';
    this.isSupported = this.checkSupport();
  }

  /**
   * 检查localStorage是否支持
   */
  checkSupport() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 生成完整的键名
   * @param {string} key 键名
   */
  getKey(key) {
    return this.prefix + key;
  }

  /**
   * 存储数据
   * @param {string} key 键名
   * @param {any} value 值
   * @param {number} expires 过期时间（毫秒）
   */
  set(key, value, expires = null) {
    if (!this.isSupported) {
      console.warn('localStorage not supported');
      return false;
    }

    try {
      const data = {
        value,
        timestamp: Date.now(),
        expires: expires ? Date.now() + expires : null
      };
      
      localStorage.setItem(this.getKey(key), JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  }

  /**
   * 读取数据
   * @param {string} key 键名
   * @param {any} defaultValue 默认值
   */
  get(key, defaultValue = null) {
    if (!this.isSupported) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(this.getKey(key));
      if (!item) return defaultValue;

      const data = JSON.parse(item);
      
      // 检查是否过期
      if (data.expires && Date.now() > data.expires) {
        this.remove(key);
        return defaultValue;
      }

      return data.value;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  }

  /**
   * 删除数据
   * @param {string} key 键名
   */
  remove(key) {
    if (!this.isSupported) return false;

    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  }

  /**
   * 清空所有数据
   */
  clear() {
    if (!this.isSupported) return false;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('Storage clear error:', e);
      return false;
    }
  }

  /**
   * 获取所有键名
   */
  keys() {
    if (!this.isSupported) return [];

    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (e) {
      console.error('Storage keys error:', e);
      return [];
    }
  }

  /**
   * 获取存储大小（字节）
   */
  size() {
    if (!this.isSupported) return 0;

    try {
      let total = 0;
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          total += localStorage.getItem(key).length;
        }
      });
      return total;
    } catch (e) {
      console.error('Storage size error:', e);
      return 0;
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key 键名
   */
  has(key) {
    if (!this.isSupported) return false;
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  /**
   * 批量设置
   * @param {Object} data 数据对象
   * @param {number} expires 过期时间
   */
  setMultiple(data, expires = null) {
    const results = {};
    Object.keys(data).forEach(key => {
      results[key] = this.set(key, data[key], expires);
    });
    return results;
  }

  /**
   * 批量获取
   * @param {Array} keys 键名数组
   * @param {any} defaultValue 默认值
   */
  getMultiple(keys, defaultValue = null) {
    const results = {};
    keys.forEach(key => {
      results[key] = this.get(key, defaultValue);
    });
    return results;
  }

  /**
   * 增加数值
   * @param {string} key 键名
   * @param {number} increment 增量
   */
  increment(key, increment = 1) {
    const current = this.get(key, 0);
    const newValue = (typeof current === 'number' ? current : 0) + increment;
    this.set(key, newValue);
    return newValue;
  }

  /**
   * 减少数值
   * @param {string} key 键名
   * @param {number} decrement 减量
   */
  decrement(key, decrement = 1) {
    return this.increment(key, -decrement);
  }

  /**
   * 向数组添加元素
   * @param {string} key 键名
   * @param {any} item 要添加的元素
   * @param {number} maxLength 最大长度
   */
  pushToArray(key, item, maxLength = null) {
    const array = this.get(key, []);
    if (!Array.isArray(array)) return false;

    array.push(item);
    
    if (maxLength && array.length > maxLength) {
      array.splice(0, array.length - maxLength);
    }

    return this.set(key, array);
  }

  /**
   * 从数组移除元素
   * @param {string} key 键名
   * @param {any} item 要移除的元素
   */
  removeFromArray(key, item) {
    const array = this.get(key, []);
    if (!Array.isArray(array)) return false;

    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
      return this.set(key, array);
    }
    return false;
  }

  /**
   * 更新对象属性
   * @param {string} key 键名
   * @param {Object} updates 更新的属性
   */
  updateObject(key, updates) {
    const obj = this.get(key, {});
    if (typeof obj !== 'object' || obj === null) return false;

    const newObj = { ...obj, ...updates };
    return this.set(key, newObj);
  }
}

// 创建全局实例
const storage = new Storage();

// 导出存储实例
if (typeof module !== 'undefined' && module.exports) {
  module.exports = storage;
} else {
  window.storage = storage;
}