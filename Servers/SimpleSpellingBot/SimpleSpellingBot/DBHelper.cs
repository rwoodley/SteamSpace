using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SimpleSpellingBot
{
    public class DBHelper
    {
        private static Object lockObject = new Object();
        public static void UpdateAssignment(
                    int assignmentid,
                    DateTime effectiveDate,
                    DateTime expirationDate,
                    String name,
                    List<Word> words
                    ) {
                        lock (lockObject)
                        {
                            var db = new DataClasses1DataContext();
                            db.Log = new DebugTextWriter();
                            Assignment ass = db.Assignments.Where(x => x.AssignmentID == assignmentid).Single();
                            ass.EffectiveDate = effectiveDate;
                            ass.ExpirationDate = expirationDate;
                            ass.Description = name;
                            db.SubmitChanges();

                            db.Words.DeleteAllOnSubmit(db.Words.Where(x => x.AssignmentID == assignmentid));
                            db.SubmitChanges();

                            foreach (Word word in words)
                            {
                                db.Words.InsertOnSubmit(word);
                            }
                            db.SubmitChanges();
                        }
        }
    }
}