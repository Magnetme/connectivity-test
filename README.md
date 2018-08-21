# Connectivity test

Accessible under multiple URLs:

- [connectivity.magnet.me](http://connectivity.magnet.me)
- [connectivity-test.magnet.me](http://connectivity-test.magnet.me)
- [x.magnet.me](http://x.magnet.me)
- [x.magnetme.com](http://x.magnetme.com)
- [connectivity.magnetme.com](http://connectivity.magnetme.com)

All domains also work under HTTPS, but primarily __test under HTTP__!

## Why

Sometimes people notify us of connectivity problems.
This system can remotely be run to quickly determine where these problems lie.
Generally it's not on the Magnet.me end, but it can be difficult to show this.
This test provides a quick and visual result to show to other parties where the problem may lie.

## How

1. Send a recruiter who reports any problem one of the above links (in case of a domain block, use the magnetme.com domain).
1. Let them share the results back with us.
1. Our IT can then infer where the problem approximately lies.
    1. If this is on our end, escalate it to get it fixed asap.
    1. If it is on the remote end, provide information back to the client, which they may in turn escalate to their IT department.
1. Offer to let one of our IT guys to help with a call, if required.

Example gif of the system running in a browser (might be outdated):
 
![Example gif](https://s3-eu-west-1.amazonaws.com/uploads-eu.hipchat.com/65597/687838/FJSo93ECw0kwmHk/2017-12-04%2023.40.49.gif)

## Tech things

1. Let the test always run under HTTP, otherwise a browser will probably refuse the HTTP tests (insecure content)
1. Hosted by AWS Cloudfront in production
1. Build by Jenkins and auto-pushed
1. The tests initiate with a small and randomized delay. Otherwise them complete that quickly that is look like it's not real #firstFeedback.
1. Obviously in React.
1. Also logs some stuff about the environment, as sometimes the problem may reside there (and not in the network path).
