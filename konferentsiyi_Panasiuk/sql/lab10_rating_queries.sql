-- Лабораторна робота № 10: запити для звітів (створити в Navicat: Query -> New Query)
USE konferentsiyi_panasiuk;

-- Рейтинг кафедр: 10 кафедр з найбільшою кількістю проведених конференцій
SELECT kafedry.nazva_kafedry,
       COUNT(konferentsiyi.id_konferentsiyi) AS count_k
FROM kafedry
LEFT JOIN spivrobitnyky ON spivrobitnyky.id_kafedry = kafedry.id_kafedry
LEFT JOIN konferentsiyi ON konferentsiyi.id_spivrobitnyky = spivrobitnyky.id_spivrobitnyky
GROUP BY kafedry.id_kafedry, kafedry.nazva_kafedry
ORDER BY count_k DESC
LIMIT 10;

-- Рейтинг співробітників: 10 співробітників з найбільшою кількістю проведених конференцій
SELECT CONCAT(spivrobitnyky.prizvyshche, ' ', LEFT(spivrobitnyky.imya, 1), '. ',
              LEFT(spivrobitnyky.pobatkovi, 1), '.') AS spivrobitnyk,
       COUNT(konferentsiyi.id_konferentsiyi) AS count_k
FROM spivrobitnyky
LEFT JOIN konferentsiyi ON konferentsiyi.id_spivrobitnyky = spivrobitnyky.id_spivrobitnyky
GROUP BY spivrobitnyky.id_spivrobitnyky
ORDER BY count_k DESC
LIMIT 10;
