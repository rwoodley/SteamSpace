using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using System.Runtime.Serialization.Json;
using System.Text;
using Newtonsoft.Json;

namespace SimpleSpellingBot
{
    public partial class Assignments : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            var db = new DataClasses1DataContext();

            if (Request.HttpMethod.Equals("GET"))
            {
                //var json = new JavaScriptSerializer().Serialize(db.Assignments.ToList());
                int classId = -1;
                Int32.TryParse((Session["ClassID"]??"-1").ToString(), out classId);
                var json = JsonConvert.SerializeObject(db.Assignments.Where(x=>
                    x.ClassID == classId && 
                    !x.IsDeleted).ToList());

                Response.Clear();
                Response.AppendHeader("Access-Control-Allow-Origin", "*");
                Response.ContentType = "application/json; charset=utf-8";
                Response.Write(json);
                Response.End();
            }

        }
    }
}