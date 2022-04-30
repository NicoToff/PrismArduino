// Programme contenu par l'Arduino et lu par le serveur avec serialport
#define pot A0

int mesure = 0;

void setup()
{
  Serial.begin(9600);
}

void loop()
{
  delay(1000);
  mesure = analogRead(pot);
  Serial.println(mesure, DEC);
}
