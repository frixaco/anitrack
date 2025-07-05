// use color_eyre::Result;
// use crossterm::event::{self, Event};
// use ratatui::{DefaultTerminal, Frame};

// fn main() -> Result<()> {
//     color_eyre::install()?;
//     let terminal = ratatui::init();
//     let result = run(terminal);
//     ratatui::restore();
//     result
// }

// fn run(mut terminal: DefaultTerminal) -> Result<()> {
//     loop {
//         terminal.draw(render)?;
//         if matches!(event::read()?, Event::Key(_)) {
//             break Ok(());
//         }
//     }
// }

// fn render(frame: &mut Frame) {
//     frame.render_widget("hello world", frame.area());
// }

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    use scraper::Html;

    let url = format!(
        "https://nyaa.si/user/subsplease?f=0&c=0_0&q={}+1080p",
        "alya"
    );

    let client = reqwest::Client::new();
    let res = client
        .post(url)
        .body("the exact body that is sent")
        .send()
        .await?;
    let html = &res.text().await?;

    let document = Html::parse_document(html);

    use scraper::Selector;
    let selector = Selector::parse("tr.success").unwrap();
    for element in document.select(&selector) {
        let title_selector = Selector::parse("td:nth-child(2) a:not(.comments)").unwrap();
        let title = element.select(&title_selector).next().unwrap();

        let magnet_selector = Selector::parse("td:nth-child(3) a[href^=\"magnet\"]").unwrap();
        let magnet = element.select(&magnet_selector).next().unwrap();

        let size_selector = Selector::parse("td:nth-child(4)").unwrap();
        let size = element.select(&size_selector).next().unwrap();

        let date_selector = Selector::parse("td[data-timestamp]").unwrap();
        let date = element.select(&date_selector).next().unwrap();

        println!("{}", title.text().collect::<String>());
        println!("{}", magnet.value().attr("href").unwrap_or(""));
        println!("{}", size.text().collect::<String>());
        println!("{}", date.text().collect::<String>());
    }

    Ok(())
}
