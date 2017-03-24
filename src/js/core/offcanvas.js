import { Modal } from '../mixin/index';
import { $, docElement, isTouch, query, transitionend } from '../util/index';

var scroll;


//if (window.CSS && window.CSS.supports && !window.CSS.supports('touch-action', 'pan-y')) {

    var xpos;

    document.documentElement.addEventListener('touchstart', e => {
        //if (!document.documentElement.classList.contains('uk-offcanvas-page')) {
            xpos = e.touches[0].clientX;
        //}
    });

    document.documentElement.addEventListener('touchmove', e => {

        var diff = Math.abs(xpos - e.touches[0].clientX);

        console.log(diff)

        if (diff > 10) {
            e.preventDefault();
        }
    });
//}


export default function (UIkit) {

    UIkit.component('offcanvas', {

        mixins: [Modal],

        args: 'mode',

        props: {
            content: String,
            mode: String,
            flip: Boolean,
            overlay: Boolean
        },

        defaults: {
            content: '.uk-offcanvas-content:first',
            mode: 'slide',
            flip: false,
            overlay: false,
            clsPage: 'uk-offcanvas-page',
            clsContainer: 'uk-offcanvas-container',
            clsPanel: 'uk-offcanvas-bar',
            clsFlip: 'uk-offcanvas-flip',
            clsContent: 'uk-offcanvas-content',
            clsContentAnimation: 'uk-offcanvas-content-animation',
            clsSidebarAnimation: 'uk-offcanvas-bar-animation',
            clsMode: 'uk-offcanvas',
            clsOverlay: 'uk-offcanvas-overlay',
            selClose: '.uk-offcanvas-close'
        },

        computed: {

            content() {
                return $(query(this.$props.content, this.$el));
            },

            clsFlip() {
                return this.flip ? this.$props.clsFlip : '';
            },

            clsOverlay() {
                return this.overlay ? this.$props.clsOverlay : '';
            },

            clsMode() {
                return `${this.$props.clsMode}-${this.mode}`;
            },

            clsSidebarAnimation() {
                return this.mode === 'none' || this.mode === 'reveal' ? '' : this.$props.clsSidebarAnimation;
            },

            clsContentAnimation() {
                return this.mode !== 'push' && this.mode !== 'reveal' ? '' : this.$props.clsContentAnimation
            },

            transitionElement() {
                return this.mode === 'reveal' ? this.panel.parent() : this.panel;
            }

        },

        update: {

            write() {

                if (this.isToggled() && this.overlay) {
                    this.content.width(window.innerWidth - (this.overlay ? this.scrollbarWidth : 0));
                    this.content.height(window.innerHeight);
                    this.content.scrollTop(scroll.y);
                }

            },

            events: ['resize', 'orientationchange']

        },

        events: [

            {
                name: 'beforeshow',

                self: true,

                handler() {

                    scroll = scroll || {x: window.pageXOffset, y: window.pageYOffset};

                    if (this.mode === 'reveal' && !this.panel.parent().hasClass(this.clsMode)) {
                        this.panel.wrap('<div>').parent().addClass(this.clsMode);
                    }

                    docElement.css('overflow-y', (!this.clsContentAnimation || this.flip) && this.scrollbarWidth && this.overlay ? 'scroll' : '');

                    this.body.addClass(`${this.clsContainer} ${this.clsFlip} ${this.clsOverlay}`).height();
                    this.content.addClass(this.clsContentAnimation);
                    this.panel.addClass(`${this.clsSidebarAnimation} ${this.mode !== 'reveal' ? this.clsMode : ''}`);
                    this.$el.addClass(this.clsOverlay).css('display', 'block').height();

                }
            },

            {
                name: 'beforehide',

                self: true,

                handler() {
                    this.content.removeClass(this.clsContentAnimation);

                    if (this.mode === 'none' || this.getActive() && this.getActive() !== this) {
                        this.panel.trigger(transitionend);
                    }
                }
            },

            {
                name: 'hidden',

                self: true,

                handler() {

                    if (this.mode === 'reveal') {
                        this.panel.unwrap();
                    }

                    if (!this.overlay) {
                        scroll = {x: window.pageXOffset, y: window.pageYOffset}
                    }

                    this.panel.removeClass(`${this.clsSidebarAnimation} ${this.clsMode}`);
                    this.$el.removeClass(this.clsOverlay).css('display', '');
                    this.body.removeClass(`${this.clsContainer} ${this.clsFlip} ${this.clsOverlay}`).scrollTop(scroll.y);

                    docElement.css('overflow-y', '');
                    this.content.width('').height('');

                    window.scrollTo(scroll.x, scroll.y);

                    scroll = null;

                }
            },

            {
                name: 'swipeLeft swipeRight',

                handler(e) {

                    if (this.isToggled() && isTouch(e) && (e.type === 'swipeLeft' && !this.flip || e.type === 'swipeRight' && this.flip)) {
                        this.hide();
                    }

                }
            }

        ]

    });

}
