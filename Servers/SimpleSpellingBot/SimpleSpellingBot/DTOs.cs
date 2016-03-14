using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SimpleSpellingBot.DTO
{
    public class Message
    {
        public String Curriculum;
        public ClassRoom[] Classes;
        public Message()
        {
            Curriculum = "Abraham Lincoln School";
            Classes = new ClassRoom[] { new ClassRoom() };
        }
    }
    public class ClassRoom
    {
        public String Name;
        public Assignment[] Assignments;
        public ClassRoom() { Name = "Ms. Moulton's Class"; }
    }
    public class Assignment
    {
        public int Id;
        public String Name;
        public DateTime EffectiveDate;
        public DateTime ExpirationDate;
        public String Language;
        public String[] Words;
        public String[] Sentences;
        public Assignment(SimpleSpellingBot.Assignment ass, int id, List<SimpleSpellingBot.Word> words)
        {
            Id = id;
            Name = ass.Description;
            EffectiveDate = ass.EffectiveDate;
            ExpirationDate = ass.ExpirationDate;
            Language = ass.Language;
            Words = words.Select(x => x.SpellingWord).ToArray();
            Sentences = words.Select(x => x.Sentence).ToArray();
        }
    }
}