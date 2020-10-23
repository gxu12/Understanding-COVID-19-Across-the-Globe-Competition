
import json
from config import app
from flask import Blueprint, render_template



import pymysql

# 测试数据暂时存放
tasks = []


@app.route('/scoredistributiondata/', methods=['POST','GET'])#
def scoredistributiondata():
 conn = pymysql.connect(host="127.0.0.1",user="root",password="root",db="movie",autocommit=True,use_unicode=True, charset='utf8')
 cur = conn.cursor()
 sql = "select * from score_distribution"  #新建新的路由进行ajax的数据传递
 result = cur.execute(sql)
 rv = cur.fetchall()
 payload = []
 content = {}

 view_data = {}
 view_data["series"] = []
 def build_view_data(item):
   dic = {}
   dic["name"] = item[0]
   dic["value"] = item[1]
   view_data["series"].append(dic)
 [build_view_data(item) for item in rv]
 return json.dumps(view_data, ensure_ascii=False)




 def build_view_data(item):
   dic = {}
   dic["name"] = item[0]
   dic["value"] = item[1]
   view_data["series"].append(dic)
 [build_view_data(item) for item in rv]
 return json.dumps(view_data, ensure_ascii=False)


@app.route("/")
def scoredistribution():
    return render_template("index.html")

# @app.route("/index")
# def index():
#     return render_template("index.html")
@app.route("/a")
def a():
    return render_template("overview.html")
@app.route("/a1")
def a1():
    return render_template("1.html")
@app.route("/a2")
def a2():
    return render_template("2.html")
@app.route("/a3")
def a3():
    return render_template("3.html")
@app.route("/a4")
def a4():
    return render_template("4.html")

if __name__ == "__main__":
    # 将host设置为0.0.0.0，则外网用户也可以访问到这个服务
    app.run(debug=True)
