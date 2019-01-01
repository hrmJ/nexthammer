<?php 

require 'vendor/autoload.php';

use PHPUnit\Framework\TestCase;
use App\Utilities;


/**
 *
 * @covers Concordancer
 *
 **/
class UtilitiesTest extends TestCase
{

    /**
     *
     * Test running open_connection
     * 
     */
    public function testOpenConnection()
    {
        $conn = App\Utilities\open_connection("dbmain");
        $this->assertTrue(!is_null($conn));
    }

}

?>
