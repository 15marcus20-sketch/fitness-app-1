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
function buildFigureSVG(pattern, sizeClass){
  return `<svg class="illustration ${sizeClass||''} anim-${pattern}" viewBox="0 0 120 160" preserveAspectRatio="xMidYMid meet">
    <g class="rig">
      <g transform="translate(60,90)">
        <g class="bodyRotate">
          <g class="upperBody">
            <line class="seg seg-torso" x1="0" y1="0" x2="0" y2="-50"/>
            <g transform="translate(0,-50)">
              <circle class="seg seg-head" cx="0" cy="-14" r="9"/>
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
                <line class="seg seg-calfL" x1="0" y1="0" x2="-2" y2="27"/>
              </g>
            </g>
          </g>
          <g class="legR">
            <line class="seg seg-thighR" x1="0" y1="0" x2="3" y2="30"/>
            <g transform="translate(3,30)">
              <g class="kneeR">
                <line class="seg seg-calfR" x1="0" y1="0" x2="2" y2="27"/>
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  </svg>`;
}

