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
    public partial class SingleAssignment : BasePage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            int testid = int.Parse(Request.QueryString["id"]);

            if (Request.HttpMethod.Equals("POST"))
            {
                string postData = new System.IO.StreamReader(Request.InputStream).ReadToEnd();
                dynamic json = System.Web.Helpers.Json.Decode(postData);
                Console.WriteLine(json.name);
                Console.WriteLine(json.words);
                int assignmentid = int.Parse(Request.QueryString["id"]);
                var temp = new List<dynamic>(json.words);
                List<Word> words = temp.Select(x =>
                    new Word()
                    {
                        SpellingWord = x.word,
                        Sentence = x.Sentence,
                        AssignmentID = assignmentid,
                        WordID = x.id
                    })
                    .ToList();

                DBHelper.UpdateAssignment(
                    assignmentid,
                    currentClassId(),
                    DateTime.Parse(json.effectiveDate),
                    DateTime.Parse(json.expirationDate),
                    (String)json.name,
                    words
                    );

            }

            {
                // For both GET and POST we send back the current DB state.

                var db = new DataClasses1DataContext();
                var words = db.Words.Where(x => x.AssignmentID == testid).ToList();

                var assignment = new DTO.Assignment(
                    db.Assignments.Where(x => x.AssignmentID == testid).Single(), testid, words);

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
}