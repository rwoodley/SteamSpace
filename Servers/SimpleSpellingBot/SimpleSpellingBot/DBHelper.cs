using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SimpleSpellingBot
{
    public class DBHelper
    {
        public static void UpdateAssignment(
                    int assignmentid,
                    DateTime effectiveDate,
                    DateTime expirationDate,
                    String name,
                    List<Word> words
                    ) {
            Console.Write(effectiveDate);
        }
    }
}