using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace SimpleSpellingBot
{
    public partial class DeleteAssignment : BasePage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            var db = new DataClasses1DataContext();

            if (Request.HttpMethod.Equals("GET"))
            {
                int testid = int.Parse(Request.QueryString["id"]);
                Assignment ass = db.Assignments.Where(x=>x.AssignmentID == testid).Single();
                if (ass.ClassID != currentClassId())
                    throw new ApplicationException("You don't own that assignment!");
                ass.IsDeleted = true;
                db.SubmitChanges();

                Response.Clear();
                Response.AppendHeader("Access-Control-Allow-Origin", "*");
                Response.ContentType = "application/json; charset=utf-8";
                Response.Write("[]");
                Response.End();
            }
        }
    }
}