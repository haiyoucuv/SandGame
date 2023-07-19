const {ccclass, property} = cc._decorator;

@ccclass
export default class PoolManager extends cc.Component {

	@property([cc.Prefab])
	private allPrefab: cc.Prefab[] = [];

	public static Instance: PoolManager = null;

	private allPrefabMap: Map<string, cc.Prefab> = null;
	private poolMap: Map<string, cc.NodePool> = null;

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		if (PoolManager.Instance != null) {
			PoolManager.Instance.destroy();
		}
		PoolManager.Instance = this;

		this.allPrefabMap = new Map<string, cc.Prefab>();
		this.poolMap = new Map<string, cc.NodePool>();
		for (let i = 0; i < this.allPrefab.length; i++) {
			this.allPrefabMap.set(this.allPrefab[i].name, this.allPrefab[i]);
			cc.log(this.allPrefab[i].name);
			let nodePool = new cc.NodePool();
			this.poolMap.set(this.allPrefab[i].name, nodePool);
			// console.log("创建时名称："+this.allPrefabMap[i].name)
			// console.log("节点池名字："+ this.poolMap[i].name)
		}
		this.allPrefabMap.forEach((value, key) => {
			console.log("value：", value, "key:", key)
		})
		this.poolMap.forEach((value, key) => {
			console.log("value：", value, "key:", key)

		})
	}

	/**从对象池中取出对象*/
	public static Spawn(_prefabName: string, _parent: cc.Node = null) {

		if (!PoolManager.Instance.poolMap.has(_prefabName)) {
			cc.warn('no prefab named ' + _prefabName);
			return null;
		}
		let pool: cc.NodePool = PoolManager.Instance.poolMap.get(_prefabName);
		if (pool.size() > 0) {
			let object = pool.get();
			console.log("我拿了一个")
			if (_parent != null)
				object.parent = _parent;
			var pos_enemy1: cc.Vec2 = cc.v2(0, 0)
			pos_enemy1.x = -200 + Math.random() * 420
			pos_enemy1.y = 600 + Math.random() * 200
			object.setPosition(pos_enemy1)
			return object;
		} else {
			let newObject = cc.instantiate(PoolManager.Instance.allPrefabMap.get(_prefabName));
			console.log("我新创建了一个")
			if (_parent != null)

				newObject.parent = _parent;
			var pos_enemy: cc.Vec2 = cc.v2(0, 0)
			pos_enemy.x = -200 + Math.random() * 420
			pos_enemy.y = 600 + Math.random() * 200
			newObject.setPosition(pos_enemy)
			return newObject;
		}
	}

	public static Despawn(_prefabName: string, _node: cc.Node) {
		if (!PoolManager.Instance.poolMap.has(_prefabName)) {
			cc.log('回收失败,节点名 : ' + _prefabName);
			return null;
		}
		let pool: cc.NodePool = PoolManager.Instance.poolMap.get(_prefabName);

		pool.put(_node);
		cc.log('回收成功,节点名 : ', _node, "节点池：", PoolManager.Instance.poolMap.get(_prefabName))

		// _node.destroy()
	}

	public static GetPrefab(_prefabName) {
		if (!PoolManager.Instance.allPrefabMap.has(_prefabName))
			return null;
		return PoolManager.Instance.allPrefabMap.get(_prefabName);
	}

	public static Preload(_prefabName, _count) {
		if (!PoolManager.Instance.poolMap.has(_prefabName))
			return null;

		let pool: cc.NodePool = PoolManager.Instance.poolMap.get(_prefabName);
		for (let i = 0; i < _count; i++) {
			let newObject = cc.instantiate(PoolManager.Instance.allPrefabMap.get(_prefabName));
			pool.put(newObject);
		}
	}
}
