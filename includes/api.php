<?php

require_once('./backend.php');

$temp = explode('/', $_SERVER['REQUEST_URI']);
$action = ($temp[count($temp) - 1]);
$resp = '';

switch($action) {
    case 'getrank':
        //GET
        $dblink = db();
        
        $data = array();
        $query = 'SELECT name, score, @rownum := @rownum + 1 AS rank FROM highscores JOIN (SELECT @rownum := 0) AS r ORDER BY score DESC';
        if ($result = $dblink->query($query)) {
            while($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        mysqli_close($dblink);
        
        $resp = $data;
    break;

    case 'addscore':
        //POST
        if (isset($_POST)&&!empty($_POST)){
            //echo 'name - ' . $_POST['name'] . ', email - ' . $_POST['email'] . ', score - ' . $_POST['score'];

            if ((strlen(trim($_POST['name'])) == 0)||(strlen(trim($_POST['email'])) == 0))
                $resp = array(array('resp'=>_EMPTY_FIELD));
            else
            {
                //perform error checking for email
                $email = $_POST['email'];
                $pattern = "/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/";
                $emailok = filter_var($email, FILTER_VALIDATE_EMAIL) && preg_match($pattern, $email);

                if (!$emailok) {
                    $resp = array(array('resp'=>_BAD_EMAIL));
                }
                else //actual insertion
                {
                    $dblink = db();
                    
                    //hopefully this prevents SQL injection via the name field
                    $filteredname = $dblink->real_escape_string($_POST['name']);
                    
                    $query = 'INSERT INTO highscores (name, email, score) VALUES ("'.$filteredname.'", "'.$_POST['email'].'", '.$_POST['score'].')';       

                    if ($result = $dblink->query($query))
                    {
                        //get the record ID of the successful insertion
                        $newinsertid = $dblink->insert_id;

                        //from that, we can get the ranking position
                        $rankquery = 'SELECT * FROM ( SELECT id, name, email, score, @rownum := @rownum + 1 AS rank FROM highscores JOIN (SELECT @rownum := 0) AS r ORDER BY score DESC ) AS h WHERE h.id = '.$newinsertid;

                        if ($rankresult = $dblink->query($rankquery))
                        {
                            $row = $rankresult->fetch_assoc();
                            $resp = array(array('resp'=>_INSERT_OK, 'rank'=> $row['rank']));
                        
                            //At this point, am I supposed to send user an email with his/her ranking + complete score list????
                            sendScoreEmail($email, $_POST['name'], $_POST['score'], $row['rank']);
                        }
                        else //insert ok, retrieval of rank not ok
                        {
                            $resp = array(array('resp'=>_INSERT_OK_RANK_FAIL, 'rank'=> ''));
                            sendScoreEmail($email, $_POST['name'], $_POST['score'], '');
                        }
                    }
                    else
                        $resp = array(array('resp'=>_INSERT_FAIL));
                    
                    mysqli_close($dblink);
                }
            }
        }
        else
        {
            $resp = array(array('resp'=>_POST_ONLY));
        }
    break;
}

echo json_encode($resp);