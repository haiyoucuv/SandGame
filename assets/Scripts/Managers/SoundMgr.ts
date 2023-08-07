import RES from "./RES";

const {ccclass, property} = cc._decorator;

const EFFECT_NUM = 8;

@ccclass
export default class SoundMgr extends cc.Component {
	public static ins: SoundMgr = null;

	private effect_volume: number = 1;
	private music_volume: number = 1;

	private music_as: cc.AudioSource = null;
	private effect_as: Array<cc.AudioSource> = [];
	private cur_as: number = 0;

	// 音乐是否静音
	private _musicMute: boolean = false;
	set musicMute(value: boolean) {
		this._musicMute = value;
		// this.music_as.mute = b_mute;
		if (value) {
			this.music_as.volume = 0;
		} else {
			this.music_as.volume = this.music_volume;
		}

		// cc.sys.localStorage.setItem("music_mute", String(value));
	}

	get musicMute() {
		return this._musicMute;
	}

	// 音效是否静音
	private _effectMute: boolean = false;
	set effectMute(value: boolean) {
		for (let i = 0; i < this.effect_as.length; i++) {
			// this.effect_as[i].mute = b_mute;
			if (value) {
				this.effect_as[i].volume = 0;
			} else {
				this.effect_as[i].volume = this.effect_volume;
			}
		}

		this._effectMute = value;
		// cc.sys.localStorage.setItem("effect_mute", String(value));
	}

	get effectMute() {
		return this._effectMute;
	}

	onLoad() {
		if (SoundMgr.ins === null) {
			SoundMgr.ins = this;
		} else {
			this.destroy();
			return;
		}

		this.music_as = this.node.addComponent(cc.AudioSource);
		this.music_as.volume = this.music_volume;

		for (let i = 0; i < EFFECT_NUM; i++) {
			const as = this.node.addComponent(cc.AudioSource);
			this.effect_as.push(as);
			as.volume = this.effect_volume;
		}
		this.cur_as = 0;

		// const isIOS = cc.sys.os === "iOS";
		// this.musicMute = isIOS;
		// this.effectMute = isIOS;

	}

    get musicVolume() {
        return this.music_volume;
    }

    set musicVolume(value) {
        this.music_volume = value;
        this.music_as.volume = value;
    }

    get effectVolume() {
        return this.effect_volume;
    }

    set effectVolume(value) {

        for (let i = 0; i < this.effect_as.length; i++) {
            this.effect_as[i].volume = value;
        }

        this.effect_volume = value;
    }

	playMusic(url, loop) {
		loop = !!loop;
		this.music_as.loop = loop;
		this.music_as.clip = RES.getRes("assets/Sounds/" + url, cc.AudioClip);
		if (this.music_as.clip) {
			this.music_as.play();
		} else {
			cc.error("music audio clip null: ", url);
		}
	}

	stopMusic() {
		this.music_as.stop();
	}

	playEffect(url) {
		const as = this.effect_as[this.cur_as];
		this.cur_as++;
		if (this.cur_as >= EFFECT_NUM) {
			this.cur_as = 0;
		}

		as.clip = RES.getRes("assets/Sounds/" + url, cc.AudioClip);
		if (as.clip) {
			as.play();
		} else {
			cc.error("effect audio clip null: ", url);
		}
	}
}
