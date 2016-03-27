using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using SimpleSpellingBot.DTO;
using Newtonsoft.Json;

namespace SimpleSpellingBot
{
    public partial class SingleAssignment : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            int testid = int.Parse(Request.QueryString["id"]);

            var db = new DataClasses1DataContext();
            var words = db.Words.Where(x => x.AssignmentID == testid).ToList();

            var assignment = new DTO.Assignment(
                db.Assignments.Where(x=>x.AssignmentID == testid).Single(), testid, words);

            //var json = new JavaScriptSerializer().Serialize(assignment);
            var json = JsonConvert.SerializeObject(assignment);

            Response.Clear();
            Response.AppendHeader("Access-Control-Allow-Origin", "*");
            Response.ContentType = "application/json; charset=utf-8";
            Response.Write(json);
            Response.End();

        }
    }
}