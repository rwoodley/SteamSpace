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
        public String[] Words;
        public String[] Sentences;
        public String Notes;
        public Assignment(String name, int id)
        {
            Id = id;
            Name = name;
            Words = new String[] { };
            Sentences = new String[] { };
            Notes = "Click to play the word, then type in the correct spelling.";
        }
    }
}