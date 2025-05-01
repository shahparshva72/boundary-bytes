All Women's Premier League match data in CSV format
===================================================

The background
--------------

As an experiment, after being asked by a user of the site, I started
converting the YAML data provided on the site into a CSV format. That
initial version was heavily influenced by the format used by the baseball
project Retrosheet. I wasn't sure of the usefulness of my CSV format, but
nothing better was suggested so I persisted with it. Later Ashwin Raman
(https://twitter.com/AshwinRaman_) send me a detailed example of a format
he felt might work and, liking what I saw, I started to produce data in
a slightly modified version of that initial example.

This particular zip folder contains the CSV data for...
  All Women's Premier League matches
...for which we have data.

How you can help
----------------

Providing feedback on the data would be the most helpful. Tell me what you
like and what you don't. Is there anything that is in the JSON data that
you'd like to be included in the CSV? Could something be included in a better
format? General views and comments help, as well as incredibly detailed
feedback. All information is of use to me at this stage. I can only improve
the data if people tell me what does works and what doesn't. I'd like to make
the data as useful as possible but I need your help to do it. Also, which of
the 2 CSV formats do you prefer, this one or the original? Ideally I'd like
to settle on a single CSV format so what should be kept from each?

Finally, any feedback as to the licence the data should be released under
would be greatly appreciated. Licensing is a strange little world and I'd
like to choose the "right" licence. My basic criteria may be that:

  * the data should be free,
  * corrections are encouraged/required to be reported to the project,
  * derivative works are allowed,
  * you can't just take data and sell it.

Feedback, pointers, comments, etc on licensing are welcome.

The format of the data
----------------------

Full documentation of this CSV format can be found at:
  https://cricsheet.org/format/csv_ashwin/
but the following is a brief summary of the details...

This format consists of 2 files per match, although you can get all of
the ball-by-ball data from just one of the files. The files for a match
are named <id>.csv (for the ball-by-ball data), and <id>_info.csv (for
the match info), where <id> is the Cricinfo id for the match. The
ball-by-ball file contains one row per delivery in the match, while the
match info file contains match information such as dates the match was
played, the outcome, and lists of the players involved in the match.

The match info file format
--------------------------

The info section contains the information on the actual match, such as
when and where it was played, any event it was part of, the type of
match etc. The fields included in the info section will each appear as
one or more rows in the data. Some of the fields are required, whereas
some are optional. If a field has multiple values, such as team, then
each value will appear on a row of it's own.

The ball-by-ball file format
----------------------------

The first row of each ball-by-ball CSV file contains the headers for the
file, with each subsequent row providing details on a single delivery.
The headers in the file are:

  * match_id
  * season
  * start_date
  * venue
  * innings
  * ball
  * batting_team
  * bowling_team
  * striker
  * non_striker
  * bowler
  * runs_off_bat
  * extras
  * wides
  * noballs
  * byes
  * legbyes
  * penalty
  * wicket_type
  * player_dismissed
  * other_wicket_type
  * other_player_dismissed

Most of the fields above should, hopefully, be self-explanatory, but some may
benefit from clarification...

"innings" contains the number of the innings within the match. If a match is
one that would normally have 2 innings, such as a T20 or ODI, then any innings
of more than 2 can be regarded as a super over.

"ball" is a combination of the over and delivery. For example, "0.3" represents
the 3rd ball of the 1st over.

"wides", "noballs", "byes", "legbyes", and "penalty" contain the total of each
particular type of extras, or are blank if not relevant to the delivery.

If a wicket occurred on a delivery then "wicket_type" will contain the method
of dismissal, while "player_dismissed" will indicate who was dismissed. There
is also the, admittedly remote, possibility that a second dismissal can be
recorded on the delivery (such as when a player retires on the same delivery
as another dismissal occurs). In this case "other_wicket_type" will record
the reason, while "other_player_dismissed" will show who was dismissed.

Matches included in this archive
--------------------------------

2025-03-15 - club - WPL - female - 1469319 - Mumbai Indians vs Delhi Capitals
2025-03-13 - club - WPL - female - 1469318 - Mumbai Indians vs Gujarat Giants
2025-03-11 - club - WPL - female - 1469317 - Royal Challengers Bengaluru vs Mumbai Indians
2025-03-10 - club - WPL - female - 1469316 - Mumbai Indians vs Gujarat Giants
2025-03-08 - club - WPL - female - 1469315 - UP Warriorz vs Royal Challengers Bengaluru
2025-03-07 - club - WPL - female - 1469314 - Delhi Capitals vs Gujarat Giants
2025-03-06 - club - WPL - female - 1469313 - UP Warriorz vs Mumbai Indians
2025-03-03 - club - WPL - female - 1469312 - Gujarat Giants vs UP Warriorz
2025-03-01 - club - WPL - female - 1469311 - Royal Challengers Bengaluru vs Delhi Capitals
2025-02-28 - club - WPL - female - 1469310 - Mumbai Indians vs Delhi Capitals
2025-02-27 - club - WPL - female - 1469309 - Royal Challengers Bengaluru vs Gujarat Giants
2025-02-26 - club - WPL - female - 1469308 - UP Warriorz vs Mumbai Indians
2025-02-25 - club - WPL - female - 1469307 - Gujarat Giants vs Delhi Capitals
2025-02-24 - club - WPL - female - 1469306 - Royal Challengers Bengaluru vs UP Warriorz
2025-02-22 - club - WPL - female - 1469305 - UP Warriorz vs Delhi Capitals
2025-02-21 - club - WPL - female - 1469304 - Royal Challengers Bengaluru vs Mumbai Indians
2025-02-19 - club - WPL - female - 1469303 - UP Warriorz vs Delhi Capitals
2025-02-18 - club - WPL - female - 1469302 - Gujarat Giants vs Mumbai Indians
2025-02-17 - club - WPL - female - 1469301 - Delhi Capitals vs Royal Challengers Bengaluru
2025-02-16 - club - WPL - female - 1469300 - UP Warriorz vs Gujarat Giants
2025-02-15 - club - WPL - female - 1469299 - Mumbai Indians vs Delhi Capitals
2025-02-14 - club - WPL - female - 1469298 - Gujarat Giants vs Royal Challengers Bengaluru
2024-03-17 - club - WPL - female - 1417737 - Delhi Capitals vs Royal Challengers Bangalore
2024-03-15 - club - WPL - female - 1417736 - Royal Challengers Bangalore vs Mumbai Indians
2024-03-13 - club - WPL - female - 1417735 - Gujarat Giants vs Delhi Capitals
2024-03-12 - club - WPL - female - 1417734 - Mumbai Indians vs Royal Challengers Bangalore
2024-03-11 - club - WPL - female - 1417733 - Gujarat Giants vs UP Warriorz
2024-03-10 - club - WPL - female - 1417732 - Delhi Capitals vs Royal Challengers Bangalore
2024-03-09 - club - WPL - female - 1417731 - Gujarat Giants vs Mumbai Indians
2024-03-08 - club - WPL - female - 1417730 - UP Warriorz vs Delhi Capitals
2024-03-07 - club - WPL - female - 1417729 - Mumbai Indians vs UP Warriorz
2024-03-06 - club - WPL - female - 1417728 - Gujarat Giants vs Royal Challengers Bangalore
2024-03-05 - club - WPL - female - 1417727 - Delhi Capitals vs Mumbai Indians
2024-03-04 - club - WPL - female - 1417726 - Royal Challengers Bangalore vs UP Warriorz
2024-03-03 - club - WPL - female - 1417725 - Delhi Capitals vs Gujarat Giants
2024-03-02 - club - WPL - female - 1417724 - Royal Challengers Bangalore vs Mumbai Indians
2024-03-01 - club - WPL - female - 1417723 - Gujarat Giants vs UP Warriorz
2024-02-29 - club - WPL - female - 1417722 - Delhi Capitals vs Royal Challengers Bangalore
2024-02-28 - club - WPL - female - 1417721 - Mumbai Indians vs UP Warriorz
2024-02-27 - club - WPL - female - 1417720 - Gujarat Giants vs Royal Challengers Bangalore
2024-02-26 - club - WPL - female - 1417719 - UP Warriorz vs Delhi Capitals
2024-02-25 - club - WPL - female - 1417718 - Gujarat Giants vs Mumbai Indians
2024-02-24 - club - WPL - female - 1417717 - Royal Challengers Bangalore vs UP Warriorz
2024-02-23 - club - WPL - female - 1417716 - Delhi Capitals vs Mumbai Indians
2023-03-26 - club - WPL - female - 1358950 - Delhi Capitals vs Mumbai Indians
2023-03-24 - club - WPL - female - 1358949 - Mumbai Indians vs UP Warriorz
2023-03-21 - club - WPL - female - 1358948 - UP Warriorz vs Delhi Capitals
2023-03-21 - club - WPL - female - 1358947 - Royal Challengers Bangalore vs Mumbai Indians
2023-03-20 - club - WPL - female - 1358946 - Mumbai Indians vs Delhi Capitals
2023-03-20 - club - WPL - female - 1358945 - Gujarat Giants vs UP Warriorz
2023-03-18 - club - WPL - female - 1358944 - Gujarat Giants vs Royal Challengers Bangalore
2023-03-18 - club - WPL - female - 1358943 - Mumbai Indians vs UP Warriorz
2023-03-16 - club - WPL - female - 1358942 - Gujarat Giants vs Delhi Capitals
2023-03-15 - club - WPL - female - 1358941 - UP Warriorz vs Royal Challengers Bangalore
2023-03-14 - club - WPL - female - 1358940 - Mumbai Indians vs Gujarat Giants
2023-03-13 - club - WPL - female - 1358939 - Royal Challengers Bangalore vs Delhi Capitals
2023-03-12 - club - WPL - female - 1358938 - UP Warriorz vs Mumbai Indians
2023-03-11 - club - WPL - female - 1358937 - Gujarat Giants vs Delhi Capitals
2023-03-10 - club - WPL - female - 1358936 - Royal Challengers Bangalore vs UP Warriorz
2023-03-09 - club - WPL - female - 1358935 - Delhi Capitals vs Mumbai Indians
2023-03-08 - club - WPL - female - 1358934 - Gujarat Giants vs Royal Challengers Bangalore
2023-03-07 - club - WPL - female - 1358933 - Delhi Capitals vs UP Warriorz
2023-03-06 - club - WPL - female - 1358932 - Royal Challengers Bangalore vs Mumbai Indians
2023-03-05 - club - WPL - female - 1358931 - Gujarat Giants vs UP Warriorz
2023-03-05 - club - WPL - female - 1358930 - Delhi Capitals vs Royal Challengers Bangalore
2023-03-04 - club - WPL - female - 1358929 - Mumbai Indians vs Gujarat Giants

Further information
-------------------

You can find all of our currently available data at https://cricsheet.org/

You can contact me via the following methods:
  Email   : stephen@cricsheet.org
  Mastodon: @cricsheet@deeden.co.uk
