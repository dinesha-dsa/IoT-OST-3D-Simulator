# IoT OST 3D Circuit Simulator Version 1.0

An interactive browser-based educational digital twin for an Arduino Uno connected to an HC-SR04 ultrasonic sensor, an IR sensor, an LED and a buzzer.

## Learning goals

- Distinguish electrical current flow from logic and data flow.
- Trace an eight-step sensor-to-controller-to-actuator sequence.
- Observe GPIO HIGH and LOW states and the alarm decision.
- Investigate common laboratory faults: disconnected ECHO, missing common ground and wrong output pin.

## Run locally

Open `dist/index.html` in a modern browser. No installation or server is required.

## Decision rule

The alarm activates when the ultrasonic distance is 10 cm or less AND the IR sensor is HIGH.

## GitHub Pages

Publish the `dist` directory using GitHub Pages or a GitHub Actions Pages workflow.

## Version

Version 1.0 is a teaching simulator. It visualises representative logic and conventional-current paths; it is not a SPICE circuit solver.
