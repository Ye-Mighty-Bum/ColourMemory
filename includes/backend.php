<?php

date_default_timezone_set('Asia/Singapore');

//db settings

/*
define("_DB", 'localhost');
define("_SCHEMA", 'killersl');
define("_USER", 'root');
define("_PASS", '');
*/

define("_DB", 'localhost');
define("_SCHEMA", 'kirasude_codetest');
define("_USER", 'kirasude_ctadmin');
define("_PASS", '24428998');

//msg settings
define("_CANNOT CONNECT", 'Unable to connect to the database.');
define("_POST_ONLY", 'Please use a POST request. GET is not available.');
define("_EMPTY_FIELD", 'Please fill out both fields.');
define("_BAD_EMAIL", 'The email has an invalid format.');
define("_INSERT_FAIL", 'An error occurred while submitting your score.<br />Please try again.');
define("_INSERT_OK", '<br />Your score was successfully submitted!<br />Your current rank is: ');
define("_INSERT_OK_RANK_FAIL", '<br />Your score was successfully submitted! ');

function db() {
    $dblink = mysqli_connect(_DB, _USER, _PASS, _SCHEMA);
    if (!$dblink) {
        /*
        echo "Error: Unable to connect to MySQL." . PHP_EOL;
        echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
        echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
        */
        echo json_encode(array(array('resp'=>_BAD_EMAIL)));
        exit;
    }

    return $dblink;
}

function sendScoreEmail($email, $name, $score, $rank) {
    $from = '';
    $to = $name.'<'.$email.'>';
    $subject = 'Congratulations on completing a round of Colour Memory!';
    
    $headers  = 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
    $headers .= 'From: Colour Memory Bot <noreply@fakeemail.com>' . "\r\n";

    $scoremsg = '';
    if ($score > 0)
        $scoremsg = 'You\'re really good! Keep it up!';
    else if ($score == 0)
        $scoremsg = 'Not bad, but it could be better.';
    else if ($score < 0)
        $scoremsg = 'Wow, you\'re really terrible at this game.';
    
    $rankmsg = '';
    if ($rank != '') { //insert ok, rank retrieval ok
        $rankmsg = '<p>Also, your current ranking is <b style="font-size:20px;">'.$rank.'</b>.</p>';
    }

    $message = '
        <html>
            <h1>Congratulations!</h1>
            <p>You\'ve cleared a round of Colour Memory with a score of '.$score.'!<br />('.$scoremsg.')</p>
            '.$rankmsg.'
        </html>
    ';            

    mail($to, $subject, $message, $headers);
}