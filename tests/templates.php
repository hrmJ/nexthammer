<?php 
use PHPUnit\Framework\TestCase;

/**
 *
 * @covers Corpus
 *
 **/
class TemplateTest extends TestCase
{

    public function testLayoutIncludesBody() {
        $tpl = new Template("templates/layout.tpl");
        $this->assertRegExp("/<body>/",$tpl->Output());
    }


}

?>
