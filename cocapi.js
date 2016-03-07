"use strict";

var clashApi = require('clash-of-clans-api');
let client = clashApi({
  token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjcyNmFmMmMzLTg4M2MtNDYwYy1iYTNhLWJiZTk2ZDc5MGMyMCIsImlhdCI6MTQ1Njc4MzA2Niwic3ViIjoiZGV2ZWxvcGVyLzhhODkwMzQzLWU0ZDAtYjlmNS1mNGFjLTljN2FhYTQwNmI1ZCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjQ2LjIyOS4xNTMuMTQ2Il0sInR5cGUiOiJjbGllbnQifV19._6932djrckwHwIhf0rRSUrwIogC4EI7IdrwDT6K1hro2XNh_ISM2Wib5P8NBGCaNmYQ7iMWtEfktQRTGgSVZbQ" // Optional, can also use COC_API_TOKEN env variable
});

client
  .clanMembersByTag('#82PQ82VV')
  .then(response => console.log(response))
  .catch(err => console.log(err));