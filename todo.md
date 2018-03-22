[ ] synonyms with wiktionary
[ ] log-likelihood + ngrams

corpusfunctions.php:

```php

$log_like = LL($occur_both, $not_occur_or, $not_occur_tr, $occur_neither);
ngram_frequency,
frequency_of_word1 - ngram_freq, 
frequency_of_word2 - ngram_freq
subcorpus_size - (which_of_the_words_is_more_Frequent)


//Dunnings Log-likelihood coefficient
function LL($a, $b, $c, $d)
{
if ($a == 0) $a = 0.001;
if ($b == 0) $b = 0.001;
if ($c == 0) $c = 0.001;
if ($d == 0) $d = 0.001; // to avoid error ln(0)

$ll = 2 * ($a * log($a) + $b * log($b) + $c * log($c) + $d * log($d) -
      ($a + $b) * log($a + $b) - ($a + $c) * log($a + $c) - 
      ($b + $d) * log ($b + $d) - ($c + $d) * log($c + $d) + 
      ($a + $b + $c + $d) * log ($a + $b + $c + $d));

$ll = round($ll, 2);
return $ll;
} // end function LL

```
