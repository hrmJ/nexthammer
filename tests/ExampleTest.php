<?php

use Laravel\Lumen\Testing\DatabaseMigrations;
use Laravel\Lumen\Testing\DatabaseTransactions;
use App\Corpusobjects\Corpus;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function testExample()
    {
        $this->corpus = new Corpus();
        var_dump($this->corpus);
        $this->get('/');
        //use App\Corpusobjects\Corpus;

        $this->assertEquals(
            $this->app->version(), $this->response->getContent()
        );
    }
}
