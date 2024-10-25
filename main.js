let gGUI;
let gRenderer, gScene, gCamera;
let gGLTFLoader, gClock, gMixer, clip, gAction, gCharacter;
let gGroup;
let gDashboard;
let gOrbitControl;
let gDragControl;


const gSphereGeometry = new THREE.SphereGeometry(0.05);
const gSphereMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, transparent: true });
var gSpheres = [];

function init(){
    gGUI                = new dat.GUI();
    gScene              = new THREE.Scene();
    gScene.background   = new THREE.Color(0x333333);
    gClock              = new THREE.Clock();
    gGLTFLoader         = new THREE.GLTFLoader();     
    gCamera             = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    gCamera.position.x  = 5;
    gCamera.position.y  = 5;
    gCamera.position.z  = 5;
    gCamera.lookAt(0, 0, 0);
    gRenderer           = new THREE.WebGLRenderer();
    gGroup              = new THREE.Group();
    gGroup.name         = "arrowHelpers";

    gRenderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( gRenderer.domElement );
    gScene.add(gGroup);
    gScene.add(new THREE.HemisphereLight( 0xffffff, 0xffffff) );
    gScene.add(new THREE.DirectionalLight( 0xffffff ) );
    gScene.add(new THREE.AxesHelper(3));
    gScene.add(new THREE.GridHelper(50,50));   
    
    gOrbitControl =  new THREE.OrbitControls( gCamera, gRenderer.domElement );
    gDragControl = new THREE.DragControls(gSpheres, gCamera, gRenderer.domElement);

    // https://discourse.threejs.org/t/cant-i-use-dragcontrol-and-orbitcontrol-at-the-same-time/4265
    gDragControl.addEventListener( 'dragstart', function () { gOrbitControl.enabled = false; } );
    gDragControl.addEventListener( 'dragend', function () { gOrbitControl.enabled = true; } );

    gGLTFLoader.load( './100STYLE_GLB/Balance/Balance_FW.glb', function ( glf ) {
        gCharacter = glf.scene;
        console.log(gCharacter)

        let count = 0;
        gCharacter.traverse(n => {
            if (n.isBone) 
            {
                gSpheres.push(new THREE.Mesh(gSphereGeometry, gSphereMaterial));
                n.getWorldPosition(gSpheres[count].position);
                console.log(gSpheres[count].position);
                // console.log('found bone: ', n.name)
            }
            else
            {
                gSpheres.push(new THREE.Mesh(gSphereGeometry, gSphereMaterial));
                n.getWorldPosition(gSpheres[count].position);
                gSpheres[count].position.x = gSpheres[count].position.x * 0.01;
                gSpheres[count].position.y = gSpheres[count].position.y * 0.01;
                gSpheres[count].position.z = gSpheres[count].position.z * 0.01;
            };
            count = count +1;
          });
        gSpheres.forEach((c) => gScene.add(c));
        gScene.add( gCharacter );
        gMixer          = new THREE.AnimationMixer(gCharacter);
        clip           = glf.animations[ 0 ]
        gAction         = gMixer.clipAction(clip);
        gAction.loop    = THREE.LoopOnce;


        /* GUI section */
        const obj = {play : ()=>{ gAction.isScheduled()? gAction.reset() : gAction.play() } };
        gGUI.add(obj,'play');
        gGUI.add(gAction,'time',0,1,0.05).listen();
        gGUI.add(gAction,'timeScale',0,1,0.05).listen();
        gGUI.add(gAction,'clampWhenFinished');
        window.action = gAction;
        const positionFolder = gGUI.addFolder("position");
        positionFolder.open();
        positionFolder.add(gCharacter.position,'x',-10,10,0.1).listen();
        positionFolder.add(gCharacter.position,'z',-10,10,0.1).listen();

        const quaternionFolder = gGUI.addFolder("quaternion");

        quaternionFolder.open();
        quaternionFolder.add(gCharacter.quaternion,'x',-1,1,0.1).listen();
        quaternionFolder.add(gCharacter.quaternion,'y',-1,1,0.1).listen();
        quaternionFolder.add(gCharacter.quaternion,'z',-1,1,0.1).listen();
        quaternionFolder.add(gCharacter.quaternion,'w',-1,1,0.1).listen();

        const tracksFolder =  gGUI.addFolder("exemple of some tracks");
        tracksFolder.open();
        const o           = {};
        const bodyParts   = ["Hips","Spine","Neck","Head","RightShoulder","LeftShoulder","RightHand","LeftHand"];
        const exemples    = []
        bodyParts.forEach(part=>exemples.push(`mixamorig${part}`))
        exemples.map(x=>{ 
            o[x] = () => {
                document.querySelector("#gDashboard").innerHTML = "";  
                displayTrackValues(gDashboard, x + '.position')
                displayTrackValues(gDashboard, x + '.quaternion')
                displayArrowHelpers(x)
            };
            tracksFolder.add(o, x);
        });

        createDashBoard();
    });
}

function animate () {
    requestAnimationFrame( animate );
    gRenderer.render( gScene, gCamera );
    gMixer?.update(gClock.getDelta());
};

function displayArrowHelpers(trackPrefix){
    for( var i = gGroup.children.length - 1; i >= 0; i--) {   
        console.log("removing");
        gGroup.remove(gGroup.children[i]); 
    }

    const neckPositionTrack = clip.tracks.find(x=>x.name===`${trackPrefix}.position`);
    const {times,values}    = neckPositionTrack;
    const positions         = [];
    const arrowHelpers      = [];

    //create chunk of size 3 
    for(i=0; i<times.length; i++) positions.push(values.slice(3 * i,3 *( i + 1 )));

    positions.map(p=>{
        const v           = new THREE.Vector3( p[0],p[1],p[2]);
        const length      = v.length();
        const origin      = new THREE.Vector3( 0, 0, 0 );
        const hex         = 0xffff00;
        const arrowHelper = new THREE.ArrowHelper( v.normalize(), origin, length, hex,0.2,0.1 );
        gGroup.add( arrowHelper );
        arrowHelpers.push(arrowHelper);
    });

    // quaternion
    const neckQuaternionTrack = clip.tracks.find(x=>x.name===`${trackPrefix}.quaternion`);
    const {times:qtimes,values:qvalues} = neckQuaternionTrack;
    const quaternions  = [];
    for(var i=0; i<qtimes.length ;i++) quaternions.push(qvalues.slice(4 * i,4 * ( i + 1 )))    ;

    const qs = quaternions.map(q => new THREE.Quaternion(q[0],q[1],q[2],q[3]));
    arrowHelpers.forEach((arrow,i)=>{ arrow.applyQuaternion(qs[i])});
    window.arrowHelper =  arrowHelpers;
}

init();
animate();  