insert into Teachers (TeacherID, SecretCode, Name, Description) Values (1,'X', 'Bob Woodley', 'Developer')

insert into Assignments (AssignmentID, ClassID, Description, Language, EffectiveDate, ExpirationDate) 
Values (1,1,'First Spelling Test', '', '2016-01-01','2017-01-01')
insert into Assignments (AssignmentID, ClassID, Description, Language, EffectiveDate, ExpirationDate) 
Values (2,1,'Second Spelling Test', '', '2016-02-01','2017-02-01')


insert into Words (AssignmentID, WordID, Word, Sentence) Values (1,1,'Rat', 'The rat darted across the alleyway')
insert into Words (AssignmentID, WordID, Word, Sentence) Values (1,2,'Cat', 'The cat purred.')
insert into Words (AssignmentID, WordID, Word, Sentence) Values (1,3,'Fat', 'You eat too much, you get fat.')

