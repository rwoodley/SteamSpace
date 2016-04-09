using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Newtonsoft.Json;

namespace SimpleSpellingBot
{
    public partial class NewAssignment : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            var db = new DataClasses1DataContext();

            if (Request.HttpMethod.Equals("GET"))
            {
                Assignment ass = new Assignment();
                ass.AssignmentID = db.GetID("Assignments", 1);
                ass.Description = "Assignment: " + DateTime.Today.ToString("d");
                ass.EffectiveDate = DateTime.Today;
                ass.ExpirationDate = DateTime.Today.AddYears(1);
                ass.Language = "US/EN";
                ass.ClassID = 1;    // TODO
                db.Assignments.InsertOnSubmit(ass);
                db.SubmitChanges();
                var json = JsonConvert.SerializeObject(ass);

                Response.Clear();
                Response.AppendHeader("Access-Control-Allow-Origin", "*");
                Response.ContentType = "application/json; charset=utf-8";
                Response.Write(json);
                Response.End();
            }
        }
    }
}