import warning from "warning";

function createDeprecationWarning() {
  let alreadyWarned = false;
  return message => {
    warning(alreadyWarned, message);
    alreadyWarned = true;
  };
}

export default createDeprecationWarning;
