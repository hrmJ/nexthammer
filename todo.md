
tf-idf-klikatut ngrammit
------------------------

- [ ] Menu, josta voi valita, mikä n-grammi
- [ ] Nappi, josta saa tulostettuu
    - ensin normalisoitu
- [ ] Ei-lemmatisoitu lista 
- [X] Otsikko tf_idf-klikatulle n-grammille

Muut 
-----

- [ ] состав биграмной (3..4) леммы
- [X] LL for 3,4,5
- [X] LRD (lexically relevant data) > 10 first tfidf... klikkaa sanaa, ja näet ngrammit, jotka siihen liittyvät

- [ ] Give the user the possibility to sort by LL by default
- [ ] synonyms with wiktionary
- [ ] log-likelihood + ngrams


Filtteröidään LRD:stä saatuja listoja, niin että lopputuloksena:

2gramm:
-------

1. A + N
2. N + A
3. P + N
4. N + N

3gramm
------

1. P + D + N
2. A + N + N
3. N + A + N
4. N + N + N
5. A + A + N
6. P + N + P
7. N + P + N

Muut ngrammit näiden yhdistelmiä

2. функцинаольная (verb centered)
=================

2gramm
------

1. V + N
2. N + V
3. V + P

3gramm
------

1. N + V + C(onj)
2. V + P + N



VERSIO 2
========

в функциональные фильтры добавил одну позицию 2gramm:
-------

1. A + N
2. N + A
3. P + N
4. N + N

3gramm
------

1. P + D + N
2. A + N + N
3. N + A + N
4. N + N + N
5. A + A + N
6. P + N + P
7. N + P + N

Muut ngrammit näiden yhdistelmiä

2. функцинаольная (verb centered)
=================

2gramm
------

1. V + N
2. N + V
3. V + P
4. P + V

3gramm
------

1. N + V + C(onj)
2. V + P + N
Со шведским мне нужна твоя помощь, там все запутанно очень для меня
ФИЛЬТРЫ РАСШИФРОВКА.txt
1 КБ

