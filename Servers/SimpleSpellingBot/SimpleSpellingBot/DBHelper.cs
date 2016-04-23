using System;
using System.Diagnostics;
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
                            //db.Log = new DebugTextWriter();
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
        public static Tuple<int, int> getClassIdForEmail(String email, String name)
        {
            Debug.WriteLine("**** Logging in as: " + email);
            var db = new DataClasses1DataContext();
            var validTeachers = db.Teachers.Where(x => x.Email.Equals(email)).ToList();
            if (validTeachers.Count() == 1)
            {
                return new Tuple<int,int>(
                    validTeachers.Single().TeacherID,
                    validTeachers.Single().TeacherID);
            }
            else if (validTeachers.Count() == 0)
            {
                Teacher trec = new Teacher();
                trec.TeacherID = db.GetID("Teachers", 1);
                trec.Email = email;
                trec.Name = name;
                db.Teachers.InsertOnSubmit(trec);
                db.SubmitChanges();
                return new Tuple<int, int>(
                    trec.TeacherID,
                    trec.TeacherID);
            }
            else
                return new Tuple<int, int>(-1, -1);
        }
    }
}