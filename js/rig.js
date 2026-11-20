const PATTERN_OPTIONS = [
  {key:"squat", label:"Squat / knee bend"},
  {key:"lunge", label:"Lunge"},
  {key:"pushup", label:"Push-up"},
  {key:"plank", label:"Plank hold"},
  {key:"sideplank", label:"Side plank hold"},
  {key:"situp", label:"Sit-up / crunch"},
  {key:"twist", label:"Seated twist"},
  {key:"jumpingjack", label:"Jumping jack"},
  {key:"highknees", label:"Running / high knees"},
  {key:"mountainclimber", label:"Mountain climber"},
  {key:"burpee", label:"Burpee"},
  {key:"curlArm", label:"Arm curl"},
  {key:"pressArm", label:"Overhead press"},
  {key:"rowArm", label:"Row / pull"},
  {key:"dip", label:"Dip"},
  {key:"pullup", label:"Pull-up"},
  {key:"bridge", label:"Hip bridge"},
  {key:"stepup", label:"Step-up / stair"},
  {key:"chairstep", label:"Step-up onto chair"},
  {key:"stretch", label:"Static stretch"},
  {key:"forwardfold", label:"Forward fold"},
  {key:"catcow", label:"Cat-cow flow"},
  {key:"shoulderroll", label:"Shoulder roll"},
  {key:"jumprope", label:"Jump rope"},
  {key:"downdog", label:"Downward dog"},
  {key:"childspose", label:"Child's pose"},
  {key:"cobra", label:"Cobra pose"},
  {key:"warrior", label:"Warrior pose"},
  {key:"tree", label:"Tree pose"},
  {key:"sunflow", label:"Sun salutation flow"},
  {key:"wallsit", label:"Wall sit"},
  {key:"legraise", label:"Leg raise (lying)"},
  {key:"hamstring", label:"Seated hamstring stretch"},
  {key:"hipflexor", label:"Hip flexor lunge stretch"},
];
const PATTERN_MIGRATE_BY_NAME = {"Wall Sit":["squat","wallsit"],"Leg Raises":["situp","legraise"],"Hamstring Stretch":["stretch","hamstring"],"Hip Flexor Stretch":["stretch","hipflexor"]};
const PATTERN_FALLBACK_BY_CATEGORY = { strength:"squat", cardio:"jumpingjack", core:"situp", mobility:"stretch", yoga:"downdog" };
function patternForExercise(ex){
  return ex.pattern || PATTERN_FALLBACK_BY_CATEGORY[ex.category] || "squat";
}
// Round 7 pictogram weight (design/REVIEW.md): same rig groups and class names, so every
// keyframe in css/animations.css still drives it. Tapered solid torso, r12 head with a
// neck gap, short feet, faint floor tick. Weight lives in css/figure.css.
function buildFigureSVG(pattern, sizeClass){
  return `<svg class="illustration ${sizeClass||''} anim-${pattern}" viewBox="0 0 120 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <line class="floor" x1="56" y1="155" x2="96" y2="155"/>
    <g class="prop prop-chair"><line x1="63" y1="134" x2="96" y2="134"/><line x1="66" y1="134" x2="66" y2="152"/><line x1="93" y1="134" x2="93" y2="152"/><line x1="93" y1="134" x2="93" y2="106"/></g>
    <g class="rig">
      <g transform="translate(60,90)">
        <g class="bodyRotate">
          <g class="upperBody">
            <path class="seg seg-torso" d="M-5,-1 Q0,2 5,-1 L7,-46 Q0,-49 -7,-46 Z"/>
            <g transform="translate(0,-50)">
              <circle class="seg seg-head" cx="0" cy="-23" r="12"/>
              <g class="armL">
                <line class="seg seg-upperarmL" x1="0" y1="0" x2="-3" y2="22"/>
                <g transform="translate(-3,22)">
                  <g class="elbowL">
                    <line class="seg seg-forearmL" x1="0" y1="0" x2="-2" y2="21"/>
                  </g>
                </g>
              </g>
              <g class="armR">
                <line class="seg seg-upperarmR" x1="0" y1="0" x2="3" y2="22"/>
                <g transform="translate(3,22)">
                  <g class="elbowR">
                    <line class="seg seg-forearmR" x1="0" y1="0" x2="2" y2="21"/>
                  </g>
                </g>
              </g>
            </g>
          </g>
          <g class="legL">
            <line class="seg seg-thighL" x1="0" y1="0" x2="-3" y2="30"/>
            <g transform="translate(-3,30)">
              <g class="kneeL">
                <line class="seg seg-calfL" x1="0" y1="0" x2="-2" y2="27"/><line class="seg seg-foot seg-footL" x1="-2" y1="27" x2="3" y2="27.5"/>
              </g>
            </g>
          </g>
          <g class="legR">
            <line class="seg seg-thighR" x1="0" y1="0" x2="3" y2="30"/>
            <g transform="translate(3,30)">
              <g class="kneeR">
                <line class="seg seg-calfR" x1="0" y1="0" x2="2" y2="27"/><line class="seg seg-foot seg-footR" x1="2" y1="27" x2="7" y2="27.5"/>
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>`;
}

