<?php 
use PHPUnit\Framework\TestCase;

/**
 *
 * @covers Filter
 *
 **/
class FilterTest extends TestCase
{

    public function testCreateFilter(){
        $f = new Filter();
        $this-> assertInstanceOf(Filter::class,$f);
    }

}

?>
