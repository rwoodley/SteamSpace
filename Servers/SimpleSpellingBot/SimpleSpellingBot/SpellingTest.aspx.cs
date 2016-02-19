using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using SimpleSpellingBot.DTO;
namespace SimpleSpellingBot
{
    public partial class SpellingTest : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            //string json = "{\"name\":\"Joe\"}";

            var db = new DataClasses1DataContext();
            var words = db.Words.Where(x => x.TestID == "1").ToList();
            var assignment = new DTO.Assignment("Sample Name", 22);
            assignment.Words = words.Select(x=>x.Word1).ToArray();
            assignment.Sentences = words.Select(x=>x.Sentence).ToArray();

            Message message = new Message();
            List<DTO.Assignment> list = (new List<DTO.Assignment>());
            list.Add(assignment);
            message.Classes[0].Assignments = list.ToArray();

            var json = new JavaScriptSerializer().Serialize(message);
            
            Response.Clear();
            Response.AppendHeader("Access-Control-Allow-Origin", "*"); 
            Response.ContentType = "application/json; charset=utf-8";
            Response.Write(json);
            Response.End();
        }
    }

}