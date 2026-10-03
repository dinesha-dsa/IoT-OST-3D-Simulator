const byte TRIG_PIN = 9;
const byte ECHO_PIN = 10;
const byte IR_PIN = 7;
const byte LED_PIN = 8;
const byte BUZZER_PIN = 6;
const unsigned long ECHO_TIMEOUT_US = 30000UL;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(IR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH, ECHO_TIMEOUT_US);
  bool irDetected = digitalRead(IR_PIN) == HIGH;

  if (duration == 0) {
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    Serial.println("ECHO TIMEOUT");
  } else {
    float distanceCm = duration * 0.0343f / 2.0f;
    bool alarm = distanceCm <= 10.0f && irDetected;
    digitalWrite(LED_PIN, alarm ? HIGH : LOW);
    digitalWrite(BUZZER_PIN, alarm ? HIGH : LOW);
    Serial.print("Distance: ");
    Serial.print(distanceCm, 1);
    Serial.print(" cm | IR: ");
    Serial.print(irDetected ? "HIGH" : "LOW");
    Serial.print(" | Output: ");
    Serial.println(alarm ? "ALERT" : "SAFE");
  }
  delay(250);
}
