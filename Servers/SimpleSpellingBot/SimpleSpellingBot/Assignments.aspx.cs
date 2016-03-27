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
                var json = JsonConvert.SerializeObject(db.Assignments.ToList());

                Response.Clear();
                Response.AppendHeader("Access-Control-Allow-Origin", "*");
                Response.ContentType = "application/json; charset=utf-8";
                Response.Write(json);
                Response.End();
            }
            if (Request.HttpMethod.Equals("POST"))
            {
                string postData = new System.IO.StreamReader(Request.InputStream).ReadToEnd();
                //var jsonReader = JsonReaderWriterFactory.CreateJsonReader(Encoding.ASCII.GetBytes(postData), new System.Xml.XmlDictionaryReaderQuotas());

                //var root = XElement.Load(jsonReader);
                //Console.WriteLine(root.XPathSelectElement("//Name").Value);
                //Console.WriteLine(root.XPathSelectElement("//Address/State").Value);

                // For that you will need to add reference to System.Web.Helpers
                dynamic json = System.Web.Helpers.Json.Decode(postData);
                Console.WriteLine(json.name);
                Console.WriteLine(json.words);
                int assignmentid = int.Parse(Request.QueryString["id"]);
                var temp = new List<dynamic>(json.words);
                List<Word> words = temp.Select(x =>
                    new Word() {
                        SpellingWord = x.word,
                        Sentence = x.Sentence,
                        AssignmentID = assignmentid
                    })
                    .ToList();

                DBHelper.UpdateAssignment(
                    assignmentid,
                    DateTime.Parse(json.effectiveDate),
                    DateTime.Parse(json.expirationDate),
                    (String) json.name,
                    words
                    );

            }


        }
    }
}