# 🗄️ MySQL数据库安装和配置指南

## 📋 目录
1. [MySQL安装](#mysql安装)
2. [数据库配置](#数据库配置)
3. [项目集成](#项目集成)
4. [常见问题](#常见问题)

---

## 🚀 MySQL安装

### Windows系统

#### 方法一：使用MySQL Installer（推荐）
1. **下载MySQL Installer**
   - 访问：https://dev.mysql.com/downloads/installer/
   - 下载 "MySQL Installer for Windows"

2. **安装步骤**
   ```bash
   # 运行安装程序
   mysql-installer-community-8.0.xx.msi
   
   # 选择安装类型
   - Developer Default (推荐)
   - 或选择 Custom 并只安装 MySQL Server
   
   # 配置MySQL Server
   - Port: 3306 (默认)
   - Root密码: 设置一个强密码
   - 添加用户: 可选
   ```

#### 方法二：使用Chocolatey
```bash
# 安装Chocolatey (如果未安装)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装MySQL
choco install mysql
```

### macOS系统

#### 使用Homebrew
```bash
# 安装Homebrew (如果未安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装MySQL
brew install mysql

# 启动MySQL服务
brew services start mysql

# 设置root密码
mysql_secure_installation
```

### Linux系统 (Ubuntu/Debian)

```bash
# 更新包列表
sudo apt update

# 安装MySQL
sudo apt install mysql-server

# 启动MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

---

## 🔧 数据库配置

### 1. 创建数据库

```sql
-- 连接到MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE chinese_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 验证数据库创建
SHOW DATABASES;
```

### 2. 创建专用用户（推荐）

```sql
-- 创建用户
CREATE USER 'chinese_app'@'localhost' IDENTIFIED BY 'your_password_here';

-- 授权
GRANT ALL PRIVILEGES ON chinese_learning.* TO 'chinese_app'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证用户
SHOW GRANTS FOR 'chinese_app'@'localhost';
```

### 3. 测试连接

```bash
# 使用新用户连接
mysql -u chinese_app -p chinese_learning

# 测试查询
SELECT VERSION();
```

---

## 🔗 项目集成

### 1. 安装Python依赖

```bash
cd backend
pip install PyMySQL cryptography
```

### 2. 配置环境变量

创建 `backend/.env` 文件：

```env
# MySQL配置
DATABASE_URL=mysql+pymysql://chinese_app:your_password_here@localhost:3306/chinese_learning?charset=utf8mb4

# Flask配置
SECRET_KEY=your-secret-key-change-in-production
FLASK_ENV=development
```

### 3. 初始化数据库

```bash
# 运行初始化脚本
python mysql_setup.py
```

### 4. 启动应用

```bash
# 使用启动脚本
start_mysql.bat

# 或手动启动
python app.py
```

---

## 🚀 快速启动

### 使用自动化脚本

1. **运行启动脚本**
   ```bash
   start_mysql.bat
   ```

2. **选择数据库类型**
   - 选择 `1` 使用SQLite（无需安装MySQL）
   - 选择 `2` 使用MySQL（需要先安装MySQL）

3. **配置MySQL连接**
   - 输入用户名（默认：root）
   - 输入密码

4. **自动初始化**
   - 脚本会自动检查依赖
   - 初始化数据库
   - 启动Web服务

---

## ❓ 常见问题

### 1. 连接被拒绝

**错误信息**：`Access denied for user 'root'@'localhost'`

**解决方案**：
```sql
-- 重置root密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### 2. 字符集问题

**错误信息**：`Incorrect string value`

**解决方案**：
```sql
-- 修改数据库字符集
ALTER DATABASE chinese_learning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 端口被占用

**错误信息**：`Can't connect to MySQL server on 'localhost'`

**解决方案**：
```bash
# 检查MySQL服务状态
# Windows
net start mysql

# Linux/macOS
sudo systemctl status mysql
```

### 4. Python依赖问题

**错误信息**：`ModuleNotFoundError: No module named 'pymysql'`

**解决方案**：
```bash
pip install PyMySQL cryptography
```

### 5. 权限问题

**错误信息**：`Access denied for user`

**解决方案**：
```sql
-- 检查用户权限
SHOW GRANTS FOR 'username'@'localhost';

-- 重新授权
GRANT ALL PRIVILEGES ON chinese_learning.* TO 'username'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📊 性能优化

### 1. 连接池配置

在 `app.py` 中添加：

```python
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True
}
```

### 2. 数据库索引

```sql
-- 创建索引
CREATE INDEX idx_article_category ON reading_article(category);
CREATE INDEX idx_article_difficulty ON reading_article(difficulty);
CREATE INDEX idx_question_article ON reading_question(article_id);
```

### 3. 查询优化

```sql
-- 分析查询性能
EXPLAIN SELECT * FROM reading_article WHERE category = 'literature';

-- 优化慢查询
-- 添加适当的索引
-- 使用LIMIT限制结果集
```

---

## 🔒 安全建议

### 1. 密码安全
- 使用强密码（至少12位，包含大小写字母、数字、特殊字符）
- 定期更换密码
- 不要在代码中硬编码密码

### 2. 用户权限
- 创建专用用户，不要使用root
- 只授予必要的权限
- 定期审查用户权限

### 3. 网络安全
- 限制数据库访问IP
- 使用SSL连接
- 定期备份数据

### 4. 生产环境
```sql
-- 生产环境配置
-- 禁用远程root登录
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1');

-- 删除测试数据库
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

-- 刷新权限
FLUSH PRIVILEGES;
```

---

## 📞 技术支持

### 获取帮助
1. **MySQL官方文档**：https://dev.mysql.com/doc/
2. **PyMySQL文档**：https://pymysql.readthedocs.io/
3. **项目Issues**：在GitHub上提交问题

### 日志查看
```bash
# MySQL错误日志
# Windows
tail -f "C:\ProgramData\MySQL\MySQL Server 8.0\Data\hostname.err"

# Linux/macOS
sudo tail -f /var/log/mysql/error.log
```

---

**🎉 恭喜！您已成功配置MySQL数据库**

现在可以享受更好的性能和扩展性了！
