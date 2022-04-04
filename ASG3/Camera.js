class Camera{
    constructor() {
        this.fov = 60;
        this.eye = new Vector3([6.25,0,0]);
        this.at = new Vector3([-100,0,0]);
        this.up = new Vector3([0,1,0]);
    }

    forward() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        this.at = this.at.add(f);
        this.eye = this.eye.add(f);
    }

    back() {
        var f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        this.at = this.at.add(f);
        this.eye = this.eye.add(f);   
    }

    left() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var s = Vector3.cross(f, this.up);
        s.normalize();
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);  
    }

    right() {
        var f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        var s = Vector3.cross(f, this.up);
        s.normalize();
        this.at = this.at.add(s);
        this.eye = this.eye.add(s);
    }

    panLeft() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);;
        var f_prime = rotationMatrix.multiplyVector3(f);
        //this.at = this.eye.add(f_prime);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panRight() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-5, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }
}