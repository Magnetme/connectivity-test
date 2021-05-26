import {performNetworkRequest, pingTest} from "./tests";
import {loadAsImage, loadAsScript} from "./loaders";

function testOf(name, description, test) {
	return {
		name,
		description,
		test,
	}
}

function margin() {
	return {};
}

/**
 * DCE uses the following domains (from https://hopin.zendesk.com/hc/en-gb/articles/360056528911-Network-Connectivity-Settings)
 - hopin.to                                     App domain                                  X
 - hopin.com                                    App domain                                  X
 - tokbox.com                                   Video control domain                        X
 - assets.hopin.to                              App domain                                  X
 - app.hopin.com                                Hopin API                                   X
 - src.litix.io                                 Tracking domain (no access required)        X
 - player.live-video.net                        AWS video offloading                        X
 - cdn.segment.com                              Tracking domain (no access required)        X
 - opentok.com                                  WebRTC video domain                         X
 - pusher.com                                   Tracking domain (no access required)        X
 - herokuapp.com                                Seems unused                                (done implicitly above)
 - mux.com                                      Seems unused                                X
 - twilio.com                                   Seems unused                                X
 - prod.live.hopin.to                           Hopin API                                   X
 - hopin-analytics-production.herokuapp.com     Tracking domain (no access required)        X
 - *.live-video.net                             AWS video offloading                        (done implicitly above)
 - *.litix.io                                   Tracking domain (no access required)        (done implicitly above)
 */
const tests = [
		margin(),

		testOf('Ping', 'Can you contact Magnet.me at all (domain)?', pingTest('https://magnet.me')),
		testOf('Ping Hopin.to', 'Can you contact our service provider?', pingTest('https://hopin.to')),
		testOf('Ping Hopin.com', 'Can you contact our service provider?', pingTest('https://hopin.com')),
		testOf('Ping CDN', 'Can you contact the CDN?', pingTest('https://assets.hopin.to')),
		testOf('Ping App', 'Can you contact the app?', pingTest('https://app.hopin.com')),
		testOf('Ping API', 'Can you contact the API?', pingTest('https://prod.live.hopin.to')),

		margin(),
		testOf('Ping Tokbox', 'Video control domain', pingTest('https://tokbox.com')),
		testOf('Ping live-video.net', 'Video offloading domain', pingTest('https://player.live-video.net')),
		testOf('Ping Opentok', 'WebRTC Video domain', pingTest('https://opentok.com')),

		margin(),
		testOf('Ping analytics1 *', '', pingTest('https://src.litix.io')),
		testOf('Ping analytics2 *', '', pingTest('https://cdn.segment.com')),
		testOf('Ping analytics3 *', '', pingTest('https://stats.pusher.com')),
		testOf('Ping analytics4 *', '', pingTest('https://hopin-analytics-production.herokuapp.com')),

		margin(),
		testOf('Script analytics1 *', '', loadAsScript('https://src.litix.io/theoplayer/3/theoplayer-mux.js')),
		testOf('Script analytics2 *', '', loadAsScript('https://cdn.segment.com/analytics.js/v1/MsAdSjf1InKNkevAlvPNpbmJLGQmt3D8/analytics.min.js')),
		testOf('Script analytics3 *', '', loadAsImage('https://pusher.com/static/pusher-logo-c34a06c6aa0c11678c5f261d23bebb03.svg')),

		margin(),
		testOf('Ping mux **', '', pingTest('https://mux.com')),
		testOf('Ping twilio **', '', pingTest('https://twilio.com')),
	]
;

export default tests;
