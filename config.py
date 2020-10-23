# 首先，需要导入flask框架
from flask import Flask

# 导入：sqlalchemy orm工具包
# 该包实现了 Python类与数据库表 之间的映射关系
# pip install flask-sqlalchemy
from flask_sqlalchemy import SQLAlchemy

# 导入驱动：python连接mysql的驱动
import pymysql

# 因为python3与python2的驱动不兼容，因此调用install_as_MySQLdb方法，以解决兼容问题
pymysql.install_as_MySQLdb()

# 创建一个flask的对象实例
# 一个web项目只需一个flask实例
app = Flask(__name__)

# url的格式为：数据库的协议：//用户名：密码@ip地址：端口号（默认可以不写）/数据库名
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://root:root@localhost:3306/movie"
# 动态追踪数据库的修改. 性能不好. 且未来版本中会移除. 目前只是为了解决控制台的提示才写的
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['JSON_AS_ASCII'] = False
# 创建数据库的操作对象
# SQLAlchemy对象需要使用 Flask 的实例进行初始化
db = SQLAlchemy(app)
