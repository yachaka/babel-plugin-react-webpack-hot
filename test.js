
import Test from 'myComponent';
import OtherCompo from './other-compo.js'
import Header from 'header'

LOL.getTheFuckOut();

function h() {
  ReactDOM.render(
    <Test />,
    getIt(),
  );
}

var obj = {
  t: ReactDOM.render(
    <OtherCompo>
      <OtherOne>
        <p>Hey</p>
      </OtherOne>
      <Header/>
    </OtherCompo>,
    document.getElementById('ok'),
  )
}
