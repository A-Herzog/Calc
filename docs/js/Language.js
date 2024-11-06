/*
Copyright 2024 Alexander Herzog

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

export {language, initLanguage};

let lang;

/* German */

const languageDE={};
lang=languageDE;

lang.GUI={};
lang.GUI.name="Rechner";
lang.GUI.tabCalculator="Rechner";
lang.GUI.tabPlotter="Funktionsplotter";
lang.GUI.tabTable="Wertetabelle";
lang.GUI.tabNumberSystems="Zahlensysteme";
lang.GUI.tabPrimeFactors="Primfaktoren";
lang.GUI.tabUnits="Einheiten";
lang.GUI.tabStatistics="Statistik";
lang.GUI.copy="Kopieren";
lang.GUI.save="Speichern";
lang.GUI.copyDiagramTable="Diagrammdaten als Tabelle kopieren";
lang.GUI.saveDiagramTable="Diagrammdaten als Tabelle speichern";
lang.GUI.copyDiagramImage="Diagramm als Bild kopieren";
lang.GUI.copyDiagramImageError="Ihr Browser unterstützt das Kopieren von Bildern leider nicht.";
lang.GUI.saveDiagramImage="Diagramm als Bild speichern";
lang.GUI.switchLanguage="Switch to <b>English</b>";
lang.GUI.switchLanguageHint="Switch to English";
lang.GUI.switchLanguageShort="English";
lang.GUI.switchLanguageMode='default';
lang.GUI.switchLanguageFile="index.html";
lang.GUI.tabColorMode="Farbmodus";
lang.GUI.tabColorModeLight="Hell";
lang.GUI.tabColorModeDark="Dunkel";
lang.GUI.tabColorModeSystemDefault="Systemvorgabe";

lang.calc={};
lang.calc.input="Zu berechnende Formel";
lang.calc.output="Ergebnis";
lang.calc.C="Eingabe löschen";
lang.calc.M="Ergebnis speichern";
lang.calc.MR="Gespeicherten Wert an Eingabe anfügen";
lang.calc.MC="Speicher löschen";
lang.calc.panelMemory="Speicher";
lang.calc.panelKeys="Tastenfeld";
lang.calc.panelConsts="Konstanten";
lang.calc.panelFunctions="Funktionen";
lang.calc.panelInfo="Anleitung";
lang.calc.panelKeysPower="Potenzieren";
lang.calc.panelKeysMod="Modulo";
lang.calc.panelKeysSqrt="Quadratwurzel";
lang.calc.panelKeysExp="Expoentialfunktion";
lang.calc.panelKeysLn="Natürlicher Logarithmus";
lang.calc.panelKeysLg="10er Logarithmus";
lang.calc.panelKeysLd="2er Logarithmus";
lang.calc.panelKeysLog="Logarithmus zu beliebiger Basis";
lang.calc.panelKeysAbs="Absolutbetrag";
lang.calc.panelKeysSign="Signum";
lang.calc.panelKeysRound="Runden";
lang.calc.panelKeysFloor="Abrunden";
lang.calc.panelKeysCeil="Aufrunden";
lang.calc.panelKeysSin="Sinus";
lang.calc.panelKeysCos="Cosinus";
lang.calc.panelKeysTan="Tangens";
lang.calc.panelKeysCot="Cotangens";
lang.calc.panelKeysMin="Minimum";
lang.calc.panelKeysMax="Maximum";
lang.calc.panelKeysSum="Summe";
lang.calc.panelKeysRange="Vektor mit fortlaufenden Zahlen";
lang.calc.panelKeysRandom="Peudozufallszahl";
lang.calc.panelKeysAsin="Arcus Sinus";
lang.calc.panelKeysAcos="Arcus Cosinus";
lang.calc.panelKeysAtan="Arcus Tangens";
lang.calc.panelKeysAcot="Arcus Cotangens";
lang.calc.panelKeysFactorial="Fakultät";
lang.calc.panelKeysBinom="Binomialkoeffizient";
lang.calc.panelKeysGcd="Größter gemeinsamer Teiler (ggT)";
lang.calc.panelKeysLcm="Kleinstes gemeinsames Vielfaches (kgV)";
lang.calc.panelKeysGamma="Gamma-Funktion";
lang.calc.panelKeysSinh="Sinus hyperbolicus";
lang.calc.panelKeysCosh="Cosinus hyperbolicus";
lang.calc.panelKeysTanh="Tangens hyperbolicus";
lang.calc.panelKeysCoth="Cotangens hyperbolicus";
lang.calc.panelKeysComplex="Komplexe Zahl";
lang.calc.panelKeysRe="Realteil";
lang.calc.panelKeysIm="Imaginärteil";
lang.calc.panelKeysConj="Konjugiert komplexe Zahl";
lang.calc.panelKeysArg="Argument (Winkel) einer komplexen Zahl";
lang.calc.panelKeysZeros="Null-Matrix";
lang.calc.panelKeysOnes="Eins-Matrix";
lang.calc.panelKeysEye="Diagonalmatrix mit Einsen";
lang.calc.panelKeysDiag="Diagonalmatrix mit vorgegebener Diagonale";
lang.calc.panelKeysCross="Kreuzprodukt zweier Vektoren";
lang.calc.panelKeysT="Matrix transponieren";
lang.calc.panelKeysSize="Vektor- oder Matrixdimension";
lang.calc.panelKeysInv="Matrix invertieren";
lang.calc.panelKeysDet="Determinante";
lang.calc.panelConstsName="Name";
lang.calc.panelConstsNameErrorEmpty="Bitte einen Namen für die Konstante angeben.";
lang.calc.panelConstsNameError="Der Name darf nur aus Buchstaben bestehen.";
lang.calc.panelConstsNameErrorInUse="Der Name wird bereits für eine andere Konstante verwendet.";
lang.calc.panelConstsValue="Wert";
lang.calc.panelConstsValueErrorEmpty="Bitte einen Wert für die Konstante angeben.";
lang.calc.panelFunctionsName="Name";
lang.calc.panelFunctionsNameErrorEmpty="Bitte einen Namen für die Funktion angeben.";
lang.calc.panelFunctionsNameError="Der Name darf nur aus Buchstaben bestehen.";
lang.calc.panelFunctionsNameErrorInUse="Der Name wird bereits für eine andere Funktion verwendet.";
lang.calc.panelFunctionsParameters="x";
lang.calc.panelFunctionsParametersErrorEmpty="Bitte einen Parameter für die Funktion angeben.";
lang.calc.panelFunctionsParametersError="Die Parameter dürfen nur aus Buchstaben bestehen.";
lang.calc.panelFunctionsValue="Wert";
lang.calc.panelFunctionsValueErrorEmpty="Bitte einen Term für die Funktion angeben.";
lang.calc.panelInfoText=`
<ul>
<li>Als Dezimaltrenner können Punkte (.) und Kommata (,) verwendet werden.</li>
<li>Besitzt eine Funktion mehrere Parameter, so werden diese durch Semikolons getrennt, z.B. "mod(5;3)" liefert 2.</li>
<li>Vektoren werden durch in eckige Klammern gesetzte, per Semikollon getrennte Werte angegeben, z.B. [1;2;3].</li>
<li>Matrizen sind Vektoren bei denen jeder Eintrag wiederum ein Vektor ist. Jeder innere Vektor definiert jeweils eine Zeile, z.B. [[1;2];[3;4]].</li>
<li>Weitere unterstützte Funktionen, die nicht auf dem Tastenfeld dargestellt sind, siehe <a href="https://mathjs.org/docs/reference/functions.html" target="_blank">MathJS-Homepage</a>.</li>
<li>Mit "sumx('x^2';'x';1;10)" und "prodx('x^2';'x';1;10)" stehen zwei Funktionen zur Verfügung, die den als ersten Parameter übergebenen Term mehrfach auswerten. Der zweite Parameter ist optional; fehlt er, wird 'x' als Variable angenommen.</li>
<li>"simplify('x+x')" versucht den übergegebenen Term zu vereinfachen.</li>
<li>"derivative('x^2';'x')" berechnet die Ableitung.</li>
<li>"integrate('x^2';'x';0;10)" berechnet numerisch den Wert des Integrals über dem angegebenen Bereich.</li>
</ul>
`;

lang.plot={};
lang.plot.clearInput="Eingabe löschen";
lang.plot.resetZoom="Standardzoom";
lang.plot.zoomInfo="Mit gedrückter <span class='border rounded-1 ps-1 pe-1'><tt>Strg</tt></span>-Taste kann per Mausrad gezoomt werden und es können Zoom-Rahmen aufgezogen werden.";
lang.plot.infoDiagramSaveValues="Werte speichern";
lang.plot.infoDiagramSaveValuesTextFiles="Textdateien";
lang.plot.infoDiagramSaveValues="Diagramm speichern";
lang.plot.infoDiagramSaveValuesGraphics="Bilddateien";
lang.plot.copyDiagramImageError="Der Browser unterstützt das Kopieren von Grafiken nicht.";

lang.table={};
lang.table.mode="Modus";
lang.table.modeFunction="Funktion";
lang.table.modeSequence="Rekursive Folge";
lang.table.functionPlaceholder="Funktionsterm in Abhängigkeit von x";
lang.table.functionStepWide="Schrittweite";
lang.table.sequencePlaceholder="Nächstes Folgenglied; Vorgänger ist a";
lang.table.sequenceSteps="Anzahl an Schritten";
lang.table.copy="Kopieren";
lang.table.copyHint="Kopiert die Tabelle in die Zwischenablage";
lang.table.save="Speichern";
lang.table.saveHint="Speichert die Tabelle als Datei";
lang.table.saveTitle="Tabelle speichern";
lang.table.saveTextFiles="Textdateien";

lang.numbers={};
lang.numbers.base="Basis";
lang.numbers.base2="Dual";
lang.numbers.base8="Oktal";
lang.numbers.base10="Dezimal";
lang.numbers.base16="Hexadezimal";
lang.numbers.baseFree="Frei";

lang.primeFactors={};
lang.primeFactors.number1="Zahl 1";
lang.primeFactors.number2="Zahl 2";
lang.primeFactors.Factorization1="Primfaktorzerlegung Zahl 1";
lang.primeFactors.Factorization2="Primfaktorzerlegung Zahl 2";
lang.primeFactors.gcd="Größter gemeinsamer Teiler ggT";
lang.primeFactors.lcm="Kleinstes gemeinsames Vielfaches kgV";
lang.primeFactors.phi1="Eulersche &phi;-Funktion von Zahl 1";
lang.primeFactors.phi2="Eulersche &phi;-Funktion von Zahl 2";
lang.primeFactors.phiWikipedia="https://de.wikipedia.org/wiki/Eulersche_Phi-Funktion";

lang.units={};
lang.units.category="Kategorie";
lang.units.length="Länge";
lang.units.lengthMeters="Meter";
lang.units.lengthMillimeters="Millimeter";
lang.units.lengthKilometers="Kilometer";
lang.units.lengthMiles="Meilen";
lang.units.lengthMilesWiki="https://de.wikipedia.org/wiki/Mile_(Einheit)";
lang.units.lengthYards="Yards";
lang.units.lengthYardsWiki="https://de.wikipedia.org/wiki/Yard";
lang.units.lengthAngstroem="\u212Bngström";
lang.units.lengthAngstroemWiki="https://de.wikipedia.org/wiki/%C3%85ngstr%C3%B6m_(Einheit)";
lang.units.lengthFeet="Fuß";
lang.units.lengthFeetWiki="https://de.wikipedia.org/wiki/Fu%C3%9F_(Einheit)";
lang.units.lengthInch="Zoll";
lang.units.lengthInchWiki="https://de.wikipedia.org/wiki/Zoll_(Einheit)";
lang.units.lengthSeaMiles="Seemeilen";
lang.units.lengthSeaMilesWiki="https://de.wikipedia.org/wiki/Seemeile";
lang.units.lengthPoints="Punkte (Schriftgrad)";
lang.units.lengthPointsWiki="https://de.wikipedia.org/wiki/Schriftgrad";
lang.units.lengthParsec="Parsec";
lang.units.lengthParsecWiki="https://de.wikipedia.org/wiki/Parsec";
lang.units.lengthAE="Astronomische Einheit";
lang.units.lengthAEWiki="https://de.wikipedia.org/wiki/Astronomische_Einheit";
lang.units.lengthLightSeconds="Lichtsekunden";
lang.units.lengthLightSecondsWiki="https://de.wikipedia.org/wiki/Lichtjahr";
lang.units.lengthKlafter="Klafter";
lang.units.lengthKlafterWiki="https://de.wikipedia.org/wiki/Klafter";
lang.units.lengthLachter="Lachter";
lang.units.lengthLachterWiki="https://de.wikipedia.org/wiki/Lachter";
lang.units.lengthLachterInfo="Es wird die Clausthaler regionale Definition verwendet.";
lang.units.area="Fläche";
lang.units.areaSquaremeters="Quadratmeter";
lang.units.areaSquarekilometers="Quadratkilometer";
lang.units.areaHektar="Hektar";
lang.units.areaHektarWiki="https://de.wikipedia.org/wiki/Hektar";
lang.units.areaAr="Ar";
lang.units.areaArWiki="https://de.wikipedia.org/wiki/Ar_(Einheit)";
lang.units.areaMorgen="Morgen";
lang.units.areaMorgenWiki="https://de.wikipedia.org/wiki/Morgen_(Einheit)";
lang.units.areaSoccerFields="Fußballfelder";
lang.units.areaSoccerFieldsWiki="https://de.wikipedia.org/wiki/Fu%C3%9Fballregeln#Spielfeld";
lang.units.areaSaarland="Saarland";
lang.units.areaSaarlandWiki="https://de.wikipedia.org/wiki/Saarland";
lang.units.volume="Volumen";
lang.units.volumeCubicMeters="Kubikmeter";
lang.units.volumeCubikMillimeters="Kubikmillimeter";
lang.units.volumeLiters="Liter";
lang.units.volumeGalons="Galonen";
lang.units.volumeGalonsWiki="https://de.wikipedia.org/wiki/Gallone";
lang.units.volumeBarrels="Barrel";
lang.units.volumeBarrelsWiki="https://de.wikipedia.org/wiki/Barrel";
lang.units.volumePints="Pint";
lang.units.volumePintsWiki="https://de.wikipedia.org/wiki/Pinte";
lang.units.volumeOkerReservoirs="Okerstauseen";
lang.units.volumeOkerReservoirsWiki="https://de.wikipedia.org/wiki/Okertalsperre";
lang.units.volumeCups="Tassen";
lang.units.volumeCupsWiki="https://de.wikipedia.org/wiki/Cup_(Raumma%C3%9F)";
lang.units.volumeTeaspoons="Teelöffel";
lang.units.volumeTeaspoonsWiki="https://de.wikipedia.org/wiki/Essbesteck#Verwendung_als_Ma%C3%9Feinheit";
lang.units.volumeTablespoons="Esslöffel";
lang.units.volumeTablespoonsWiki="https://de.wikipedia.org/wiki/Essbesteck#Verwendung_als_Ma%C3%9Feinheit";
lang.units.velocity="Geschwindigkeit";
lang.units.velocityKmh="Kilometer pro Stunde";
lang.units.velocityMs="Meter pro Sekunde";
lang.units.velocityMsUnit="m/Sek.";
lang.units.velocityMih="Meilen pro Stunde";
lang.units.velocityKnots="Seemeilen pro Stunde"
lang.units.velocityKnotsUnit="Knoten";
lang.units.velocityKnotsWiki="https://de.wikipedia.org/wiki/Knoten_(Einheit)";
lang.units.velocityMach="Schallgeschwindigkeit";
lang.units.velocityMachWiki="https://de.wikipedia.org/wiki/Schallgeschwindigkeit";
lang.units.velocityLightspeed="Lichtgeschwindigkeit";
lang.units.velocityLightspeedWiki="https://de.wikipedia.org/wiki/Lichtgeschwindigkeit";
lang.units.power="Leistung";
lang.units.powerW="Watt";
lang.units.powerWWiki="https://de.wikipedia.org/wiki/Watt_(Einheit)";
lang.units.powerPS="Pferdestärken";
lang.units.powerPSUnit="PS";
lang.units.powerPSWiki="https://de.wikipedia.org/wiki/Pferdest%C3%A4rke";
lang.units.energy="Energie";
lang.units.energyJoule="Joule";
lang.units.energyWh="Wattstunden";
lang.units.energyWs="Wattsekunden";
lang.units.energyCal="Kalorien";
lang.units.energyCalWiki="https://de.wikipedia.org/wiki/Kalorie";
lang.units.energyEV="Elektronenvolt";
lang.units.energyEVWiki="https://de.wikipedia.org/wiki/Elektronenvolt";
lang.units.energyNm="Newton-Meter";
lang.units.energySKE="Steinkohleeinheit"
lang.units.energySKEWiki="https://de.wikipedia.org/wiki/Steinkohleeinheit";
lang.units.energyBTU="British thermal unit";
lang.units.energyBTUWiki="https://de.wikipedia.org/wiki/British_thermal_unit";
lang.units.temperature="Temperatur";
lang.units.temperatureCelsius="Grad Celsius";
lang.units.temperatureCelsiusWiki="https://de.wikipedia.org/wiki/Grad_Celsius";
lang.units.temperatureFahrenheit="Grad Fahrenheit";
lang.units.temperatureFahrenheitWiki="https://de.wikipedia.org/wiki/Grad_Fahrenheit";
lang.units.temperatureKelvin="Kelvin"
lang.units.temperatureKelvinWiki="https://de.wikipedia.org/wiki/Kelvin";
lang.units.pressure="Druck";
lang.units.pressurePa="Pascal";
lang.units.pressurehPa="Hektopascal";
lang.units.pressuremBar="Millibar";
lang.units.pressuremmHg="Millimeter Quecksilbersäule";
lang.units.pressuremmHgWiki="https://de.wikipedia.org/wiki/Torr";
lang.units.pressureBar="Bar";
lang.units.pressureATM="Atmosphären";
lang.units.pressureATMWiki="https://de.wikipedia.org/wiki/Physikalische_Atmosph%C3%A4re";
lang.units.pressurePSI="Poundal per square foot";
lang.units.pressurePSIWiki="https://de.wikipedia.org/wiki/Pound-force_per_square_inch";
lang.units.WeightAndMass="Gewicht und Masse";
lang.units.WeightAndMassKilogramm="Kilogramm";
lang.units.WeightAndMassGramm="Gramm";
lang.units.WeightAndMassPfund="Pfund";
lang.units.WeightAndMassZentner="Zentner";
lang.units.WeightAndMassTons="Tonnen";
lang.units.WeightAndMassNewton="Newton";
lang.units.WeightAndMassNewtonWiki="https://de.wikipedia.org/wiki/Newton_(Einheit)";
lang.units.WeightAndMassPound="Pound";
lang.units.WeightAndMassPoundWiki="https://de.wikipedia.org/wiki/Avoirdupois";
lang.units.WeightAndMassOunces="Unzen";
lang.units.WeightAndMassOuncesWiki="https://de.wikipedia.org/wiki/Unze";
lang.units.WeightAndMassCarat="Karat";
lang.units.WeightAndMassCaratWiki="https://de.wikipedia.org/wiki/Metrisches_Karat";
lang.units.angle="Winkel";
lang.units.angleDEG="Grad (DEG)";
lang.units.angleDEGWiki="https://de.wikipedia.org/wiki/Grad_(Winkel)";
lang.units.angleRAD="Bogenmaß";
lang.units.angleRADWiki="https://de.wikipedia.org/wiki/Radiant_(Einheit)";
lang.units.angleGON="Neugrad";
lang.units.angleGONWiki="https://de.wikipedia.org/wiki/Gon";
lang.units.angleFullCircle="Vollwinkel";

lang.statistics={};
lang.statistics.MeasuredValues="Messwerte";
lang.statistics.MeasuredValuesInfo="Eine Zahl pro Zeilen hier eingeben";
lang.statistics.Characteristics="Kenngrößen";
lang.statistics.countLines="Anzahl an Zeilen insgesamt";
lang.statistics.countEmpty="Anzahl an leeren Zeilen";
lang.statistics.countInvalid="Anzahl an Zeilen, die keine Zahlen enthalten";
lang.statistics.countNumbers="Anzahl an Zeilen mit Zahlen";
lang.statistics.sum="Summe der Zahlen";
lang.statistics.min="Minimum";
lang.statistics.max="Maximum";
lang.statistics.range="Spannweite";
lang.statistics.meanArithmetic="Arithmetischer Mittelwert";
lang.statistics.meanGeometric="Geometrischer Mittelwert";
lang.statistics.meanHarmonic="Harmonischer Mittelwert";
lang.statistics.median="Median";
lang.statistics.variance="Varianz";
lang.statistics.sd="Standardabweichung";
lang.statistics.cv="Variationskoeffizient";
lang.statistics.confidenceInterval="Konfidenzintervall zum Niveau";
lang.statistics.confidenceIntervalRadius="Konfidenzradius";

/* English */

const languageEN={};
lang=languageEN;

lang.GUI={};
lang.GUI.name="Calculator";
lang.GUI.tabCalculator="Calculator";
lang.GUI.tabPlotter="Function plotter";
lang.GUI.tabTable="Table";
lang.GUI.tabNumberSystems="Number systems";
lang.GUI.tabPrimeFactors="Prim factors";
lang.GUI.tabUnits="Units";
lang.GUI.tabStatistics="Statistics";
lang.GUI.copy="Copy";
lang.GUI.save="Save";
lang.GUI.copyDiagramTable="Copy diagram data as table";
lang.GUI.saveDiagramTable="Save diagram data as table";
lang.GUI.copyDiagramImage="Copy diagram image";
lang.GUI.copyDiagramImageError="Your browser does not support copying images to clipboard.";
lang.GUI.saveDiagramImage="Save diagram image";
lang.GUI.switchLanguage="Auf <b>Deutsch</b> umschalten";
lang.GUI.switchLanguageHint="Auf Deutsch umschalten";
lang.GUI.switchLanguageShort="Deutsch";
lang.GUI.switchLanguageMode='de';
lang.GUI.switchLanguageFile="index_de.html";
lang.GUI.tabColorMode="Color mode";
lang.GUI.tabColorModeLight="Light";
lang.GUI.tabColorModeDark="Dark";
lang.GUI.tabColorModeSystemDefault="System default";

lang.calc={};
lang.calc.input="Formula to be calculated";
lang.calc.output="Result";
lang.calc.C="Clear input";
lang.calc.M="Store result";
lang.calc.MR="Insert stored value into input";
lang.calc.MC="Clear memory";
lang.calc.panelMemory="Memory";
lang.calc.panelKeys="Keypad";
lang.calc.panelConsts="Constants";
lang.calc.panelFunctions="Functions";
lang.calc.panelInfo="Usage instructions";
lang.calc.panelKeysPower="Power";
lang.calc.panelKeysMod="Modulo";
lang.calc.panelKeysSqrt="Square root";
lang.calc.panelKeysExp="Expoential function";
lang.calc.panelKeysLn="Natural Logarithm";
lang.calc.panelKeysLg="Base 10 Logarithm";
lang.calc.panelKeysLd="Base 2 Logarithm";
lang.calc.panelKeysLog="Logarithm to arbitrary base";
lang.calc.panelKeysAbs="Absolute value";
lang.calc.panelKeysSign="Sign";
lang.calc.panelKeysRound="Round";
lang.calc.panelKeysFloor="Round off";
lang.calc.panelKeysCeil="Round up";
lang.calc.panelKeysSin="Sinus";
lang.calc.panelKeysCos="Cosinus";
lang.calc.panelKeysTan="Tangens";
lang.calc.panelKeysCot="Cotangens";
lang.calc.panelKeysMin="Minimum";
lang.calc.panelKeysMax="Maximum";
lang.calc.panelKeysSum="Sum";
lang.calc.panelKeysRange="Vector with sequential numbers";
lang.calc.panelKeysRandom="Peudo random numbers";
lang.calc.panelKeysAsin="Arcus sinus";
lang.calc.panelKeysAcos="Arcus cosinus";
lang.calc.panelKeysAtan="Arcus tangens";
lang.calc.panelKeysAcot="Arcus cotangens";
lang.calc.panelKeysFactorial="Factorial";
lang.calc.panelKeysBinom="Binomial coefficient";
lang.calc.panelKeysGcd="Greatest common divisor";
lang.calc.panelKeysLcm="Least common multiple";
lang.calc.panelKeysGamma="Gamma function";
lang.calc.panelKeysSinh="Sinus hyperbolicus";
lang.calc.panelKeysCosh="Cosinus hyperbolicus";
lang.calc.panelKeysTanh="Tangens hyperbolicus";
lang.calc.panelKeysCoth="Cotangens hyperbolicus";
lang.calc.panelKeysComplex="Complex number";
lang.calc.panelKeysRe="Real part";
lang.calc.panelKeysIm="Imaginary part";
lang.calc.panelKeysConj="Conjugated complex number";
lang.calc.panelKeysArg="Argument (angle) of a complex number";
lang.calc.panelKeysZeros="Zero matrix";
lang.calc.panelKeysOnes="Ones matrix";
lang.calc.panelKeysEye="Diagonal matrix with ones";
lang.calc.panelKeysDiag="Diagonal matrix with specified diagonal";
lang.calc.panelKeysCross="Cross product of two vectors";
lang.calc.panelKeysT="Transpose matrix";
lang.calc.panelKeysSize="Vector or matrix dimension";
lang.calc.panelKeysInv="Invert matrix";
lang.calc.panelKeysDet="Determinant";
lang.calc.panelConstsName="Name";
lang.calc.panelConstsNameErrorEmpty="Please enter a name for the constant.";
lang.calc.panelConstsNameError="The name may only consist of letters.";
lang.calc.panelConstsNameErrorInUse="The name is already used for another constant.";
lang.calc.panelConstsValue="Value";
lang.calc.panelConstsValueErrorEmpty="Please enter a value for the constant.";
lang.calc.panelFunctionsName="Name";
lang.calc.panelFunctionsNameErrorEmpty="Please enter a name for the function.";
lang.calc.panelFunctionsNameError="The name may only consist of letters.";
lang.calc.panelFunctionsNameErrorInUse="The name is already used for another function.";
lang.calc.panelFunctionsParameters="x";
lang.calc.panelFunctionsParametersErrorEmpty="Please enter a parameter for the function.";
lang.calc.panelFunctionsParametersError="The parameters may only consist of letters.";
lang.calc.panelFunctionsValue="Value";
lang.calc.panelFunctionsValueErrorEmpty="Please enter a term for the function.";
lang.calc.panelInfoText=`
<ul>
<li>Dots (.) and commas (,) can be used as decimal separators.</li>
<li>If a function has several parameters, these are separated by semicolons, e.g. "mod(5;3)" returns 2.</li>
<li>Vectors are indicated by their values enclosed in square brackets and separated by semicolons, e.g. [1;2;3].</li>
<li>Matrices are vectors in which each entry is in turn a vector. Each inner vector defines a row, e.g. [[1;2];[3;4]].</li>
<li>Other supported functions that are not shown on the keypad, see <a href="https://mathjs.org/docs/reference/functions.html" target="_blank">MathJS homepage</a>.</li>
<li>With "sumx('x^2';'x';1;10)" and "prodx('x^2';'x';1;10)" there are two function which will evaluate the term given in the first parameter. The second parameter is optional; if its missing, 'x' will be assumed as variable.</li>
<li>"simplify('x+x')" tries to simplify the specified term.</li>
<li>"derivative('x^2';'x')" calculates the derivative.</li>
<li>"integrate('x^2';'x';0;10)" numerically calculates the value of the integral over the specified range.</li>
</ul>
`;

lang.plot={};
lang.plot.clearInput="Clear input";
lang.plot.resetZoom="Reset zoom";
lang.plot.zoomInfo="By holding down the <span class='border rounded-1 ps-1 pe-1 bg-light'><tt>Ctrl</tt></span> key, the mouse wheel can be used to zoom in and out, and zoom frames can be drawn.";
lang.plot.infoDiagramSaveValues="Save values";
lang.plot.infoDiagramSaveValuesTextFiles="Text files";
lang.plot.infoDiagramSaveValues="Save diagram";
lang.plot.infoDiagramSaveValuesGraphics="Image files";
lang.plot.copyDiagramImageError="The browser does not support copying images to clipboard.";

lang.table={};
lang.table.mode="Mode";
lang.table.modeFunction="Function";
lang.table.modeSequence="Recursive sequence";
lang.table.functionPlaceholder="Function term as a function of x";
lang.table.functionStepWide="Step width";
lang.table.sequencePlaceholder="Next sequence member; predecessor is a";
lang.table.sequenceSteps="Number of steps";
lang.table.copy="Copy";
lang.table.copyHint="Copies the table to the clipboard";
lang.table.save="Save";
lang.table.saveHint="Saves the table as a file";
lang.table.saveTitle="Save table";
lang.table.saveTextFiles="Text files";

lang.numbers={};
lang.numbers.base="Base";
lang.numbers.base2="Dual";
lang.numbers.base8="Octal";
lang.numbers.base10="Decimal";
lang.numbers.base16="Hexadecimal";
lang.numbers.baseFree="Free";

lang.primeFactors={};
lang.primeFactors.number1="Number 1";
lang.primeFactors.number2="Number 2";
lang.primeFactors.Factorization1="Prime factorization 1";
lang.primeFactors.Factorization2="Prime factorization 2";
lang.primeFactors.gcd="Greatest common divisor gcd";
lang.primeFactors.lcm="Least common multiple lcm";
lang.primeFactors.phi1="Euler &phi; function of number 1";
lang.primeFactors.phi2="Euler &phi; function of number 2";
lang.primeFactors.phiWikipedia="https://en.wikipedia.org/wiki/Euler%27s_totient_function";

lang.units={};
lang.units.category="Category";
lang.units.length="Length";
lang.units.lengthMeters="Meters";
lang.units.lengthMillimeters="Millimeters";
lang.units.lengthKilometers="Kilometers";
lang.units.lengthMiles="Miles";
lang.units.lengthMilesWiki="https://en.wikipedia.org/wiki/Mile#International";
lang.units.lengthYards="Yards";
lang.units.lengthYardsWiki="https://en.wikipedia.org/wiki/Yard";
lang.units.lengthAngstroem="\u212Bngström";
lang.units.lengthAngstroemWiki="https://en.wikipedia.org/wiki/Angstrom";
lang.units.lengthFeet="Feet";
lang.units.lengthFeetWiki="https://en.wikipedia.org/wiki/Foot_(unit)";
lang.units.lengthInch="Inch";
lang.units.lengthInchWiki="https://en.wikipedia.org/wiki/Inch";
lang.units.lengthSeaMiles="Nautical miles";
lang.units.lengthSeaMilesWiki="https://en.wikipedia.org/wiki/Nautical_mile";
lang.units.lengthPoints="Points (font size)";
lang.units.lengthPointsWiki="https://en.wikipedia.org/wiki/Typographic_unit";
lang.units.lengthParsec="Parsec";
lang.units.lengthParsecWiki="https://en.wikipedia.org/wiki/Parsec";
lang.units.lengthAE="Astronomic unit";
lang.units.lengthAEWiki="https://en.wikipedia.org/wiki/Astronomical_unit";
lang.units.lengthLightSeconds="Light seconds";
lang.units.lengthLightSecondsWiki="https://en.wikipedia.org/wiki/Light-year";
lang.units.lengthKlafter="Klafter";
lang.units.lengthKlafterWiki="https://en.wikipedia.org/wiki/Klafter";
lang.units.lengthLachter="Lachter";
lang.units.lengthLachterWiki="https://en.wikipedia.org/wiki/Lachter";
lang.units.lengthLachterInfo="The Clausthal regional definition will be used."
lang.units.area="Area";
lang.units.areaSquaremeters="Square meters";
lang.units.areaSquarekilometers="Square kilometers";
lang.units.areaHektar="Hektar";
lang.units.areaHektarWiki="https://en.wikipedia.org/wiki/Hectare";
lang.units.areaAr="Ar";
lang.units.areaArWiki="https://en.wikipedia.org/wiki/Hectare#Are";
lang.units.areaMorgen="Morgen";
lang.units.areaMorgenWiki="https://en.wikipedia.org/wiki/Morgen";
lang.units.areaSoccerFields="Soccer fields";
lang.units.areaSoccerFieldsWiki="https://en.wikipedia.org/wiki/Laws_of_the_Game_(association_football)";
lang.units.areaSaarland="Saarland";
lang.units.areaSaarlandWiki="https://en.wikipedia.org/wiki/Saarland";
lang.units.volume="Volume";
lang.units.volumeCubicMeters="Cubic meters";
lang.units.volumeCubikMillimeters="Cubic millimeters";
lang.units.volumeLiters="Liters";
lang.units.volumeGalons="Galons";
lang.units.volumeGalonsWiki="https://en.wikipedia.org/wiki/Gallon";
lang.units.volumeBarrels="Barrels";
lang.units.volumeBarrelsWiki="https://en.wikipedia.org/wiki/Barrel_(unit)";
lang.units.volumePints="Pints";
lang.units.volumePintsWiki="https://en.wikipedia.org/wiki/Pint";
lang.units.volumeOkerReservoirs="Oker reservoirs";
lang.units.volumeOkerReservoirsWiki="https://en.wikipedia.org/wiki/Oker_Dam";
lang.units.volumeCups="Cups";
lang.units.volumeCupsWiki="https://en.wikipedia.org/wiki/Cup_(unit)";
lang.units.volumeTeaspoons="Teaspoons";
lang.units.volumeTeaspoonsWiki=null; /* No English Wikipedia page */
lang.units.volumeTablespoons="Tablespoons";
lang.units.volumeTablespoonsWiki=null; /* No English Wikipedia page */
lang.units.velocity="Velocity";
lang.units.velocityKmh="Kilometers per hour";
lang.units.velocityMs="Meters per second";
lang.units.velocityMsUnit="m/sec.";
lang.units.velocityMih="Miles per hour";
lang.units.velocityKnots="Sea miles per hour";
lang.units.velocityKnotsUnit="Knotes";
lang.units.velocityKnotsWiki="https://en.wikipedia.org/wiki/Knot_(unit)";
lang.units.velocityMach="Speed of sound";
lang.units.velocityMachWiki="https://en.wikipedia.org/wiki/Speed_of_sound";
lang.units.velocityLightspeed="Speed of light";
lang.units.velocityLightspeedWiki="https://en.wikipedia.org/wiki/Speed_of_light";
lang.units.power="Power";
lang.units.powerW="Watt";
lang.units.powerWWiki="https://en.wikipedia.org/wiki/Watt";
lang.units.powerPS="Horse power";
lang.units.powerPSUnit="HP";
lang.units.powerPSWiki="https://en.wikipedia.org/wiki/Horsepower";
lang.units.energy="Energy";
lang.units.energyJoule="Joule";
lang.units.energyWh="Watt hours";
lang.units.energyWs="Watt seconds";
lang.units.energyCal="Calories";
lang.units.energyCalWiki="https://en.wikipedia.org/wiki/Calorie";
lang.units.energyEV="Electron volt";
lang.units.energyEVWiki="https://en.wikipedia.org/wiki/Electronvolt";
lang.units.energyNm="Newton meter";
lang.units.energySKE="Hard coal unit"
lang.units.energySKEWiki=null; /* No English Wikipedia page */
lang.units.energyBTU="British thermal unit";
lang.units.energyBTUWiki="https://en.wikipedia.org/wiki/British_thermal_unit";
lang.units.temperature="Temperature";
lang.units.temperatureCelsius="Degree Celsius";
lang.units.temperatureCelsiusWiki="https://en.wikipedia.org/wiki/Celsius";
lang.units.temperatureFahrenheit="Degree Fahrenheit";
lang.units.temperatureFahrenheitWiki="https://en.wikipedia.org/wiki/Fahrenheit";
lang.units.temperatureKelvin="Kelvin";
lang.units.temperatureKelvinWiki="https://en.wikipedia.org/wiki/Kelvin";
lang.units.pressure="Pressure";
lang.units.pressurePa="Pascal";
lang.units.pressurehPa="Hektopascal";
lang.units.pressuremBar="Millibar";
lang.units.pressuremmHg="Millimeters of mercury column";
lang.units.pressuremmHgWiki="https://en.wikipedia.org/wiki/Torr";
lang.units.pressureBar="Bar";
lang.units.pressureATM="Atmospheres";
lang.units.pressureATMWiki="https://en.wikipedia.org/wiki/Standard_atmosphere_(unit)";
lang.units.pressurePSI="Poundal per square foot";
lang.units.pressurePSIWiki="https://en.wikipedia.org/wiki/Pound_per_square_inch";
lang.units.WeightAndMass="Weight and mass";
lang.units.WeightAndMassKilogramm="Kilogramms";
lang.units.WeightAndMassGramm="Gramms";
lang.units.WeightAndMassPfund="Pfund";
lang.units.WeightAndMassZentner="Zentner";
lang.units.WeightAndMassTons="Tons";
lang.units.WeightAndMassNewton="Newton";
lang.units.WeightAndMassNewtonWiki="https://en.wikipedia.org/wiki/Newton_(unit)";
lang.units.WeightAndMassPound="Pound";
lang.units.WeightAndMassPoundWiki="https://en.wikipedia.org/wiki/Avoirdupois";
lang.units.WeightAndMassOunces="Ounces";
lang.units.WeightAndMassOuncesWiki="https://en.wikipedia.org/wiki/Ounce";
lang.units.WeightAndMassCarat="Carat";
lang.units.WeightAndMassCaratWiki="https://en.wikipedia.org/wiki/Carat_(mass)";
lang.units.angle="Angle";
lang.units.angleDEG="Degree (DEG)";
lang.units.angleDEGWiki="https://en.wikipedia.org/wiki/Degree_(angle)";
lang.units.angleRAD="Radians";
lang.units.angleRADWiki="https://en.wikipedia.org/wiki/Radian";
lang.units.angleGON="New degree";
lang.units.angleGONWiki="https://en.wikipedia.org/wiki/Gradian";
lang.units.angleFullCircle="Full angle";

lang.statistics={};
lang.statistics.MeasuredValues="Measured values";
lang.statistics.MeasuredValuesInfo="Input one number per line here";
lang.statistics.Characteristics="Characteristics";
lang.statistics.countLines="Number of lines in total";
lang.statistics.countEmpty="Number of empty lines";
lang.statistics.countInvalid="Number of lines that do not contain values";
lang.statistics.countNumbers="Number of lines with values";
lang.statistics.sum="Sum of values";
lang.statistics.min="Minimum";
lang.statistics.max="Maximum";
lang.statistics.range="Range";
lang.statistics.meanArithmetic="Arithmetic mean";
lang.statistics.meanGeometric="Geometric mean";
lang.statistics.meanHarmonic="Harmonic mean";
lang.statistics.median="Median";
lang.statistics.variance="Variance";
lang.statistics.sd="Standard deviation";
lang.statistics.cv="Coefficient of variation";
lang.statistics.confidenceInterval="Confidence interval for level";
lang.statistics.confidenceIntervalRadius="confidence radius";

/* Activate language */

let language;

/**
 * Sets the program language from the document element language.
 */
function initLanguage() {
  language=(document.documentElement.lang=='de')?languageDE:languageEN;
}
