
import St from 'gi://St';
import Soup from 'gi://Soup';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';

import {Extension} from
    'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from
    'resource:///org/gnome/shell/ui/main.js';

import * as PanelMenu from
    'resource:///org/gnome/shell/ui/panelMenu.js';


export default class PublicIPExtension extends Extension {

    enable() {
        // HTTP session
        this._session = new Soup.Session({
            timeout: 10
        });

        // Create panel indicator
        this._indicator = new PanelMenu.Button(
            0.0,
            'Public IP',
            false
        );

        // IP address label
        this._label = new St.Label({
            text: 'Public IP: loading...',
            y_align: Clutter.ActorAlign.CENTER
        });

        this._indicator.add_child(this._label);

        // Add indicator to GNOME panel
        Main.panel.addToStatusArea(
            this.uuid,
            this._indicator
        );

        // Click to refresh manually
        this._indicator.connect(
            'button-press-event',
            () => {
                this._fetchIP();
                return Clutter.EVENT_STOP;
            }
        );

        // Initial lookup
        this._fetchIP();

        // Refresh every 60 seconds
        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            60,
            () => {
                this._fetchIP();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    _fetchIP() {
        const url = 'https://ifconfig.me/ip';

        const message = Soup.Message.new(
            'GET',
            url
        );

        this._label.set_text('Public IP: updating...');

        this._session.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session, result) => {
                try {
                    const bytes = session.send_and_read_finish(result);

                    if (message.get_status() !== Soup.Status.OK) {
                        throw new Error(
                            `HTTP error: ${message.get_status()}`
                        );
                    }

                    const ip = new TextDecoder()
                        .decode(bytes.get_data())
                        .trim();

                    // Basic validation of returned address
                    if (!/^[0-9a-fA-F:.]+$/.test(ip)) {
                        throw new Error('Invalid IP response');
                    }

                    this._label.set_text(`Public IP: ${ip}`);

                } catch (error) {
                    console.error(
                        `[Public IP] ${error.message}`
                    );

                    this._label.set_text('Public IP: unavailable');
                }
            }
        );
    }

    disable() {
        // Stop periodic refresh
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }

        // Close network session
        if (this._session) {
            this._session.abort();
            this._session = null;
        }

        // Remove panel indicator
        this._indicator?.destroy();
        this._indicator = null;
        this._label = null;
    }
}
